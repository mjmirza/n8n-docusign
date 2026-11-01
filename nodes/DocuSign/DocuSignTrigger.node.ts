import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
	ICredentialTestFunctions,
	ICredentialsDecrypted,
	INodeCredentialTestResult,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import crypto from 'crypto';
import { docuSignRequest, assertSafeId } from './transport';

/** True when a stored Connect configuration still has this trigger's events, JSON SIM delivery and HMAC. */
export function matchesSubscription(config: IDataObject, events: string[], options: IDataObject = {}): boolean {
	const stored = Array.isArray(config.events) ? (config.events as string[]).map(String) : [];
	const sameEvents = stored.length === events.length && events.every((e) => stored.includes(e));
	const format = (config.eventData as IDataObject | undefined)?.format;
	const json = format === undefined || String(format).toLowerCase() === 'json';
	const sim = config.deliveryMode === undefined || config.deliveryMode === 'SIM';
	const hmac = config.includeHMAC === undefined || String(config.includeHMAC) === 'true';
	// An unreported setting counts as matching; a reported one must equal what this node creates.
	const same = (key: string, want: boolean) => config[key] === undefined || String(config[key]) === String(want);
	const settings =
		same('includeDocuments', options.includeDocuments === true) &&
		same('includeCertificateOfCompletion', options.includeCertificateOfCompletion === true) &&
		same('requiresAcknowledgement', options.requireAcknowledgement !== false);
	return sameEvents && json && sim && hmac && settings;
}

/** Refuses activation without a Connect HMAC key; DocuSign keys cannot be created through the API. */
async function requireHmacKey(ctx: IHookFunctions, options?: IDataObject): Promise<void> {
	const opts = options ?? (ctx.getNodeParameter('options', {}) as IDataObject);
	if ((await resolveHmacSecrets(ctx, opts)).length === 0) {
		throw new NodeOperationError(
			ctx.getNode(),
			'Add a DocuSign Connect HMAC credential with the key from DocuSign Admin > Connect > Connect Keys',
		);
	}
}

/** Deletes a Connect configuration; a 404 means it is already gone. */
async function deleteStaleSubscription(
	ctx: IHookFunctions,
	accountId: string,
	connectId: string,
): Promise<void> {
	try {
		await docuSignRequest(ctx, 'DELETE', `/accounts/${accountId}/connect/${connectId}`);
	} catch (error) {
		if (!isNotFound(error)) throw new NodeApiError(ctx.getNode(), error as JsonObject);
	}
}

export class DocuSignTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DocuSign Trigger',
		name: 'docuSignTrigger',
		icon: { light: 'file:docusign.light.svg', dark: 'file:docusign.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description:
			'Receive real-time events from DocuSign via Connect webhooks',
		defaults: {
			name: 'DocuSign Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'docuSignOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
			{
				name: 'docuSignJwtApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['jwt'],
					},
				},
			},
			{
				// Preferred home for the Connect HMAC key: credentials are encrypted and not exported.
				name: 'docuSignConnectHmacApi',
				required: false,
				testedBy: 'docuSignConnectHmacTest',
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			// ------------------------------------------------------------------
			// Authentication method selector
			// ------------------------------------------------------------------
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
					{
						name: 'JWT (Service Integration)',
						value: 'jwt',
					},
				],
				default: 'oAuth2',
			},

			// ------------------------------------------------------------------
			// Account ID
			// ------------------------------------------------------------------
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				default: '',
				description:
					'The DocuSign Account ID (GUID). Find it in DocuSign Admin > Account > API.',
			},

			// ------------------------------------------------------------------
			// Events to listen for
			// ------------------------------------------------------------------
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description: 'The envelope events to listen for',
				options: [
					{
						name: 'Envelope Completed',
						value: 'envelope-completed',
					},
					{
						name: 'Envelope Created',
						value: 'envelope-created',
					},
					{
						name: 'Envelope Declined',
						value: 'envelope-declined',
					},
					{
						name: 'Envelope Delivered',
						value: 'envelope-delivered',
					},
					{
						name: 'Envelope Sent',
						value: 'envelope-sent',
					},
					{
						name: 'Envelope Voided',
						value: 'envelope-voided',
					},
					{
						name: 'Recipient Auth Failed',
						value: 'recipient-authenticationfailed',
					},
					{
						name: 'Recipient Auto Responded',
						value: 'recipient-autoresponded',
					},
					{
						name: 'Recipient Completed',
						value: 'recipient-completed',
					},
					{
						name: 'Recipient Declined',
						value: 'recipient-declined',
					},
					{
						name: 'Recipient Delivered',
						value: 'recipient-delivered',
					},
					{
						name: 'Recipient Sent',
						value: 'recipient-sent',
					},
				],
			},

			// ------------------------------------------------------------------
			// Options
			// ------------------------------------------------------------------
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Documents',
						name: 'includeDocuments',
						type: 'boolean',
						default: false,
						description:
							'Whether to include document PDFs in the webhook payload (increases payload size significantly)',
					},
					{
						displayName: 'Include Certificate of Completion',
						name: 'includeCertificateOfCompletion',
						type: 'boolean',
						default: false,
						description:
							'Whether to include the Certificate of Completion in the webhook payload',
					},
					{
						displayName: 'Require Acknowledgement',
						name: 'requireAcknowledgement',
						type: 'boolean',
						default: true,
						description:
							'Whether DocuSign should require acknowledgement of received events',
					},
					{
						displayName: 'HMAC Secret',
						name: 'hmacSecret',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						description:
							'Deprecated, use the DocuSign Connect HMAC credential instead, which is encrypted and not included in workflow exports. Used only when no such credential is set. The HMAC key from DocuSign Admin > Connect > Connect Keys.',
					},
				],
			},
		],
	};

	methods = {
		credentialTest: {
			// DocuSign has no endpoint to check an HMAC key, so this checks it is usable locally.
			async docuSignConnectHmacTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const keys = parseHmacSecrets(credential.data?.hmacSecret);
				return keys.length > 0
					? { status: 'OK', message: `${keys.length} key(s) ready. Events are verified when they arrive.` }
					: { status: 'Error', message: 'Enter the key from DocuSign Admin > Connect > Connect Keys' };
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// n8n skips create() for an existing subscription, so the key requirement is checked here too.
				await requireHmacKey(this);
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;

				if (webhookData.connectId) {
					try {
						const accountId = assertSafeId(
							this.getNodeParameter('accountId') as string,
							'Account ID',
						);
						const connectId = assertSafeId(
							String(webhookData.connectId),
							'Connect ID',
						);
						const config = (await docuSignRequest(
							this,
							'GET',
							`/accounts/${accountId}/connect/${connectId}`,
						)) as IDataObject;

						// GET connect/{connectId} returns connectConfigResults: { configurations: [...] }.
						const configurations = Array.isArray(config?.configurations)
							? (config.configurations as IDataObject[])
							: [config];
						const events = this.getNodeParameter('events', []) as string[];
						const wanted = this.getNodeParameter('options', {}) as IDataObject;
						if (configurations.some((c) => c?.urlToPublishTo === webhookUrl && matchesSubscription(c, events, wanted))) {
							return true;
						}
						// An old URL or changed settings: remove it so create() registers the current one.
						await deleteStaleSubscription(this, accountId, connectId);
						delete webhookData.connectId;
					} catch (error) {
						this.logger.warn('DocuSign Connect configuration check failed', {
							connectId: String(webhookData.connectId),
							error: (error as Error).message,
						});
						// Only a confirmed 404 means the subscription is gone. Any other failure is
						// raised, so a transient error never creates a second, duplicate subscription.
						if (!isNotFound(error)) throw new NodeOperationError(this.getNode(), error as Error);
					}
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const accountId = assertSafeId(
					this.getNodeParameter('accountId') as string,
					'Account ID',
				);
				const events = this.getNodeParameter('events') as string[];
				const options = this.getNodeParameter('options', {}) as IDataObject;

				// Connect HMAC keys are created in DocuSign Admin and cannot be set through the API,
				// so a secret generated here could never match. Without a key the trigger cannot
				// verify events, so it refuses to activate instead of accepting unsigned calls.
				await requireHmacKey(this, options);

				// includeHMAC makes DocuSign sign each event with the account's Connect keys.
				// configurationType and deliveryMode are required by the spec; SIM sends one message per event.
				const connectConfig: IDataObject = {
					configurationType: 'custom',
					deliveryMode: 'SIM',
					enableLog: 'true',
					urlToPublishTo: webhookUrl,
					name: `n8n-${this.getNode().name}-${Date.now()}`,
					allUsers: 'true',
					allowEnvelopePublish: 'true',
					includeDocumentFields: 'true',
					requiresAcknowledgement: String(
						options.requireAcknowledgement !== false,
					),
					// Modern event names (envelope-sent, recipient-completed) belong in events;
					// envelopeEvents and recipientEvents only take legacy names like Sent.
					events,
					includeSenderAccountasCustomField: 'true',
					includeTimeZoneInformation: 'true',
					includeEnvelopeVoidReason: 'true',
					includeHMAC: 'true',
					eventData: {
						version: 'restv2.1',
						format: 'json',
						includeData: [
							'tabs',
							'recipients',
							'custom_fields',
							// JSON notifications only carry PDFs when listed here.
							...(options.includeDocuments ? ['documents'] : []),
						],
					},
				};

				if (options.includeDocuments) {
					connectConfig.includeDocuments = 'true';
				}
				if (options.includeCertificateOfCompletion) {
					connectConfig.includeCertificateOfCompletion = 'true';
				}

				const response = (await docuSignRequest(
					this,
					'POST',
					`/accounts/${accountId}/connect`,
					connectConfig,
				)) as IDataObject;

				if (!response.connectId) {
					return false;
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.connectId = response.connectId;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.connectId) {
					try {
						const accountId = assertSafeId(
							this.getNodeParameter('accountId') as string,
							'Account ID',
						);
						const connectId = assertSafeId(
							String(webhookData.connectId),
							'Connect ID',
						);
						await docuSignRequest(
							this,
							'DELETE',
							`/accounts/${accountId}/connect/${connectId}`,
						);
					} catch (error) {
						this.logger.warn('DocuSign Connect configuration cleanup failed', {
							connectId: String(webhookData.connectId),
							error: (error as Error).message,
						});
						// Keep the ID unless DocuSign confirmed it is gone, so the next
						// deactivation can still remove the subscription instead of orphaning it.
						if (!isNotFound(error)) return false;
					}
				}

				delete webhookData.connectId;
				delete webhookData.hmacSecret;

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const headers = this.getHeaderData() as IDataObject;
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const secrets = await resolveHmacSecrets(this, options);

		const req = this.getRequestObject();
		const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

		// Fail closed: no key, no raw body, or no matching signature means the event is rejected.
		if (secrets.length === 0 || !rawBody || !verifyDocuSignSignature(rawBody, headers, secrets)) {
			const res = this.getResponseObject();
			res.status(401).json({ message: 'Invalid or missing DocuSign HMAC signature' });
			return { noWebhookResponse: true };
		}

		// A valid signature proves the account, not the subscription: DocuSign signs every
		// configuration's events with the same keys. Skip events this trigger did not ask for.
		if (!isForThisSubscription(this, body)) {
			this.getResponseObject().status(200).json({ ignored: true });
			return { noWebhookResponse: true };
		}

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}

// Only a subscribed event from this trigger's own Connect configuration runs the workflow.
// Fails closed: a payload missing either field (for example legacy XML) is ignored.
export function isForThisSubscription(ctx: IWebhookFunctions, body: IDataObject): boolean {
	const configured = ctx.getNodeParameter('events', []);
	const events = Array.isArray(configured) ? (configured as string[]) : [];
	if (typeof body.event !== 'string' || !events.includes(body.event)) return false;
	const connectId = ctx.getWorkflowStaticData('node').connectId;
	if (body.configurationId === undefined || connectId === undefined) return false;
	return String(body.configurationId) === String(connectId);
}

/** The HMAC credential wins; the deprecated node option is the fallback for older workflows. */
export async function resolveHmacSecrets(
	ctx: IHookFunctions | IWebhookFunctions,
	options: IDataObject,
): Promise<string[]> {
	// An attached credential is the only source: if it fails to load, no key, so calls are rejected.
	if (ctx.getNode().credentials?.docuSignConnectHmacApi) {
		try {
			return parseHmacSecrets((await ctx.getCredentials('docuSignConnectHmacApi'))?.hmacSecret);
		} catch {
			return [];
		}
	}
	return parseHmacSecrets(options.hmacSecret);
}

/** Splits the HMAC Secret option into keys; commas allow two keys during rotation. */
export function parseHmacSecrets(value: unknown): string[] {
	if (typeof value !== 'string') return [];
	return value
		.split(',')
		.map((v) => v.trim())
		.filter((v) => v.length > 0);
}

/**
 * DocuSign sends one x-docusign-signature-N header per active Connect key, each a
 * base64 HMAC-SHA256 of the raw body. Any header matching any configured key passes.
 */
export function verifyDocuSignSignature(
	rawBody: Buffer,
	headers: IDataObject,
	secrets: string[],
): boolean {
	const signatures = Object.entries(headers)
		.filter(([name]) => /^x-docusign-signature-\d+$/i.test(name))
		.map(([, value]) => (Array.isArray(value) ? value[0] : value))
		.filter((value): value is string => typeof value === 'string' && value.length > 0);
	if (signatures.length === 0) return false;

	for (const secret of secrets) {
		const expected = Buffer.from(
			crypto.createHmac('sha256', secret).update(rawBody).digest('base64'),
			'utf8',
		);
		for (const signature of signatures) {
			const actual = Buffer.from(signature, 'utf8');
			if (actual.length === expected.length && crypto.timingSafeEqual(actual, expected)) {
				return true;
			}
		}
	}
	return false;
}

/** True when a DocuSign call failed with HTTP 404. */
function isNotFound(error: unknown): boolean {
	const e = error as { httpCode?: string | number; statusCode?: number };
	return Number(e?.httpCode ?? e?.statusCode) === 404;
}
