import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import crypto from 'crypto';
import { docuSignRequest, assertSafeId } from './transport';

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
							'Required. The HMAC key from DocuSign Admin > Connect > Connect Keys. DocuSign signs every event with it and unsigned or mismatched events are rejected. Separate several keys with commas during key rotation.',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
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

						if (config && (config.urlToPublishTo as string) === webhookUrl) {
							return true;
						}
					} catch (error) {
						// The Connect configuration was removed or is unreachable, so n8n recreates it.
						this.logger.warn('DocuSign Connect configuration check failed', {
							connectId: String(webhookData.connectId),
							error: (error as Error).message,
						});
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
				if (parseHmacSecrets(options.hmacSecret).length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'Add the HMAC key from DocuSign Admin > Connect > Connect Keys under Options > HMAC Secret',
					);
				}

				// includeHMAC makes DocuSign sign each event with the account's Connect keys.
				const connectConfig: IDataObject = {
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
						includeData: ['tabs', 'recipients', 'custom_fields'],
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
						// Cleanup is best effort, the workflow still deactivates.
						this.logger.warn('DocuSign Connect configuration cleanup failed', {
							connectId: String(webhookData.connectId),
							error: (error as Error).message,
						});
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
		const secrets = parseHmacSecrets(options.hmacSecret);

		const req = this.getRequestObject();
		const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

		// Fail closed: no key, no raw body, or no matching signature means the event is rejected.
		if (secrets.length === 0 || !rawBody || !verifyDocuSignSignature(rawBody, headers, secrets)) {
			const res = this.getResponseObject();
			res.status(401).json({ message: 'Invalid or missing DocuSign HMAC signature' });
			return { noWebhookResponse: true };
		}

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
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
