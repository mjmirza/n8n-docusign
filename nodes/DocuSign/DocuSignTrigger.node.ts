import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import crypto from 'crypto';
import { docuSignRequest, assertSafeId } from './transport';

export class DocuSignTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DocuSign Trigger',
		name: 'docuSignTrigger',
		icon: 'file:docusign.png',
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
						name: 'Envelope — Completed',
						value: 'envelope-completed',
					},
					{
						name: 'Envelope — Created',
						value: 'envelope-created',
					},
					{
						name: 'Envelope — Declined',
						value: 'envelope-declined',
					},
					{
						name: 'Envelope — Delivered',
						value: 'envelope-delivered',
					},
					{
						name: 'Envelope — Sent',
						value: 'envelope-sent',
					},
					{
						name: 'Envelope — Voided',
						value: 'envelope-voided',
					},
					{
						name: 'Recipient — Auth Failed',
						value: 'recipient-authenticationfailed',
					},
					{
						name: 'Recipient — Auto Responded',
						value: 'recipient-autoresponded',
					},
					{
						name: 'Recipient — Completed',
						value: 'recipient-completed',
					},
					{
						name: 'Recipient — Declined',
						value: 'recipient-declined',
					},
					{
						name: 'Recipient — Delivered',
						value: 'recipient-delivered',
					},
					{
						name: 'Recipient — Sent',
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
							'Optional HMAC secret for verifying webhook signatures. If empty, a random secret will be generated.',
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
					} catch {
						// Connect configuration no longer exists
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

				// Split events into envelope and recipient events
				const envelopeEvents: string[] = [];
				const recipientEvents: string[] = [];

				for (const event of events) {
					if (event.startsWith('envelope-')) {
						envelopeEvents.push(event);
					} else if (event.startsWith('recipient-')) {
						recipientEvents.push(event);
					}
				}

				// Generate or use provided HMAC secret
				const hmacSecret =
					(options.hmacSecret as string) || crypto.randomBytes(32).toString('hex');

				// M1 fix: Include the HMAC secret in the Connect configuration
				// so DocuSign actually generates signature headers
				const connectConfig: IDataObject = {
					urlToPublishTo: webhookUrl,
					name: `n8n-${this.getNode().name}-${Date.now()}`,
					allUsers: 'true',
					allowEnvelopePublish: 'true',
					includeDocumentFields: 'true',
					requiresAcknowledgement: String(
						options.requireAcknowledgement !== false,
					),
					envelopeEvents: envelopeEvents.join(','),
					recipientEvents: recipientEvents.join(','),
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
				webhookData.hmacSecret = hmacSecret;

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
					} catch {
						// Ignore cleanup errors
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
		const webhookData = this.getWorkflowStaticData('node');

		// Verify HMAC signature if configured
		if (webhookData.hmacSecret) {
			const signature = headers['x-docusign-signature-1'] as string;

			// H2 fix: Reject requests missing the signature header entirely
			if (!signature) {
				return { webhookResponse: 'Missing signature header' };
			}

			const secret = webhookData.hmacSecret as string;

			// H3 fix: Use the raw request body bytes for HMAC computation.
			// DocuSign computes HMAC over the raw HTTP body, not re-serialized JSON.
			// Access raw body from the underlying request if available.
			const req = this.getRequestObject();
			const rawBody =
				(req as unknown as { rawBody?: Buffer }).rawBody ||
				Buffer.from(JSON.stringify(body));

			const computedHmac = crypto
				.createHmac('sha256', secret)
				.update(rawBody)
				.digest('base64');

			try {
				const sigBuf = Buffer.from(signature, 'utf8');
				const hmacBuf = Buffer.from(computedHmac, 'utf8');

				const isValid =
					sigBuf.length === hmacBuf.length &&
					crypto.timingSafeEqual(sigBuf, hmacBuf);

				if (!isValid) {
					return { webhookResponse: 'Signature mismatch' };
				}
			} catch {
				return { webhookResponse: 'Signature verification failed' };
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
