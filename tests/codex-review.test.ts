// Regression tests for the Codex review findings. Each pins the request DocuSign expects,
// checked against the eSignature v2.1 OpenAPI spec, not just that a call was made.
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { generateKeyPairSync, createVerify, createHmac } from 'crypto';
import type { IDataObject, IExecuteFunctions, IHookFunctions, IWebhookFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { createMockContext, createHttpError, getRecordedRequests } from './helpers/mockContext';
import { docuSignRequest, clearBaseUriCache, toEsignBaseUrl } from '../nodes/DocuSign/transport';
import { handleEnvelope } from '../nodes/DocuSign/resources/envelope/envelope.handler';
import { handleTemplate } from '../nodes/DocuSign/resources/template/template.handler';
import { handleChunkedUpload } from '../nodes/DocuSign/resources/chunkedUpload/chunkedUpload.handler';
import { handleEnvelopeView } from '../nodes/DocuSign/resources/envelopeView/envelopeView.handler';
import { handleAuthorization } from '../nodes/DocuSign/resources/authorization/authorization.handler';
import { handleEnvelopeAttachment } from '../nodes/DocuSign/resources/envelopeAttachment/envelopeAttachment.handler';
import { DocuSign } from '../nodes/DocuSign/DocuSign.node';
import {
	DocuSignTrigger,
	verifyDocuSignSignature,
	parseHmacSecrets,
} from '../nodes/DocuSign/DocuSignTrigger.node';
import { DocuSignJwtApi, buildDocuSignJwtAssertion } from '../credentials/DocuSignJwtApi.credentials';
import { handleRecipient } from '../nodes/DocuSign/resources/recipient/recipient.handler';
import { handleTemplateDocument } from '../nodes/DocuSign/resources/templateDocument/templateDocument.handler';
import { handleTemplateRecipient } from '../nodes/DocuSign/resources/templateRecipient/templateRecipient.handler';
import { handleEnvelopePublish } from '../nodes/DocuSign/resources/envelopePublish/envelopePublish.handler';
import { handleUserContact } from '../nodes/DocuSign/resources/userContact/userContact.handler';
import { handleEnvelopeLock } from '../nodes/DocuSign/resources/envelopeLock/envelopeLock.handler';
import { handleTemplateLock } from '../nodes/DocuSign/resources/templateLock/templateLock.handler';
import { handleFolder } from '../nodes/DocuSign/resources/folder/folder.handler';
import { handleWorkspaceItem } from '../nodes/DocuSign/resources/workspaceItem/workspaceItem.handler';
import { handleUser } from '../nodes/DocuSign/resources/user/user.handler';
import { handleEnvelopeTemplate } from '../nodes/DocuSign/resources/envelopeTemplate/envelopeTemplate.handler';
import { handleEnvelopeComment } from '../nodes/DocuSign/resources/envelopeComment/envelopeComment.handler';
import { handleAccountPasswordRule } from '../nodes/DocuSign/resources/accountPasswordRule/accountPasswordRule.handler';
import { handleDiagnosticService } from '../nodes/DocuSign/resources/diagnosticService/diagnosticService.handler';
import { handleDiagnosticResource } from '../nodes/DocuSign/resources/diagnosticResource/diagnosticResource.handler';
import { DocuSignConnectHmacApi } from '../credentials/DocuSignConnectHmacApi.credentials';
import { handleConnectConfiguration } from '../nodes/DocuSign/resources/connectConfiguration/connectConfiguration.handler';
import { handleEnvelopeRecipientTab } from '../nodes/DocuSign/resources/envelopeRecipientTab/envelopeRecipientTab.handler';
import { handleTemplateRecipientTab } from '../nodes/DocuSign/resources/templateRecipientTab/templateRecipientTab.handler';
import { handleGroup } from '../nodes/DocuSign/resources/group/group.handler';
import { handleBillingPlan } from '../nodes/DocuSign/resources/billingPlan/billingPlan.handler';
import { handleEnvelopeCustomField } from '../nodes/DocuSign/resources/envelopeCustomField/envelopeCustomField.handler';
import { handleTemplateCustomField } from '../nodes/DocuSign/resources/templateCustomField/templateCustomField.handler';
import { handleAccount } from '../nodes/DocuSign/resources/account/account.handler';
import { matchSpecRoute } from './setup/spec-routes';
import { readFileSync } from 'fs';

// Some tests assert inside catch; an unexpected success must fail them.
beforeEach(() => {
	expect.hasAssertions();
});

const C = { docuSignOAuth2Api: { environment: 'demo' } };
const DEMO = 'https://demo.docusign.net/restapi/v2.1';

function params(map: Record<string, unknown>): Record<string, Record<number, unknown>> {
	return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, { 0: v }]));
}

/** Binary stored outside memory: data is a storage id, the bytes come from getBinaryDataBuffer. */
function withStoredBinary(ctx: IExecuteFunctions, bytes: Buffer): IExecuteFunctions {
	const helpers = ctx.helpers as unknown as Record<string, unknown>;
	helpers.assertBinaryData = () => ({ data: 'filesystem-v2', fileName: 'contract.pdf', mimeType: 'application/pdf' });
	helpers.getBinaryDataBuffer = async () => bytes;
	return ctx;
}

beforeEach(() => clearBaseUriCache());

describe('createFromTemplate keeps every template role field (H1)', () => {
	it('sends accessCode, email notification and SMS delivery', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({
				accountId: 'acct-1',
				templateId: 'tpl-1',
				templateStatus: 'sent',
				templateEmailSubject: '',
				templateRoles: {
					role: [
						{
							roleName: 'Signer 1',
							email: 'a@example.com',
							name: 'A',
							accessCode: '4711',
							emailNotificationSubject: 'Please sign',
							emailNotificationBody: 'Thanks',
							deliveryMethod: 'sms',
							phoneNumber: '+49 170 1234567',
						},
					],
				},
			}),
			httpResponses: [{ envelopeId: 'e-1' }],
		});
		await handleEnvelope(ctx, 'createFromTemplate', 0);
		const body = getRecordedRequests(ctx)[0].options.body as IDataObject;
		expect(body.templateRoles).toEqual([
			{
				roleName: 'Signer 1',
				email: 'a@example.com',
				name: 'A',
				accessCode: '4711',
				emailNotification: { emailSubject: 'Please sign', emailBody: 'Thanks' },
				deliveryMethod: 'SMS',
				phoneNumber: { countryCode: '49', number: '1701234567' },
			},
		]);
	});
});

describe('envelope delete moves to the recycle bin (H2)', () => {
	it('PUTs the envelope id into folders/recyclebin and never voids', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'env-9' }),
			httpResponses: [{}],
		});
		const result = await handleEnvelope(ctx, 'delete', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.method).toBe('PUT');
		expect(req.url).toBe(`${DEMO}/accounts/acct-1/folders/recyclebin`);
		expect(req.body).toEqual({ envelopeIds: ['env-9'] });
		expect(result).toEqual({ envelopeId: 'env-9', deleted: true });
	});
});

describe('JWT credential authenticates (H3)', () => {
	const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
	const pem = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();
	const creds = { environment: 'demo', integrationKey: 'ik-1', userId: 'user-1', privateKey: pem, accountId: 'acct-1' };

	it('builds a verifiable RS256 grant with the DocuSign claims', () => {
		const jwt = buildDocuSignJwtAssertion(creds, 1_000);
		const [h, p, sig] = jwt.split('.');
		expect(JSON.parse(Buffer.from(h, 'base64url').toString())).toEqual({ alg: 'RS256', typ: 'JWT' });
		expect(JSON.parse(Buffer.from(p, 'base64url').toString())).toEqual({
			iss: 'ik-1',
			sub: 'user-1',
			aud: 'account-d.docusign.com',
			iat: 1_000,
			exp: 4_600,
			scope: 'signature impersonation',
		});
		const verifier = createVerify('RSA-SHA256');
		verifier.update(`${h}.${p}`);
		expect(verifier.verify(publicKey, Buffer.from(sig, 'base64url'))).toBe(true);
	});

	it('accepts a key pasted with literal \\n sequences', () => {
		const oneLine = { ...creds, privateKey: pem.replace(/\n/g, '\\n') };
		expect(() => buildDocuSignJwtAssertion(oneLine)).not.toThrow();
	});

	it('exchanges the grant at /oauth/token and authenticates with the bearer token', async () => {
		const cred = new DocuSignJwtApi();
		const httpRequest = jest.fn(async () => ({ access_token: 'tok-1', expires_in: 3600 }));
		const result = await cred.preAuthentication.call({ helpers: { httpRequest } } as never, creds);
		expect(result).toEqual({ accessToken: 'tok-1' });
		const call = (httpRequest.mock.calls[0] as unknown[])[0] as IDataObject;
		expect(call.method).toBe('POST');
		expect(call.url).toBe('https://account-d.docusign.com/oauth/token');
		const form = new URLSearchParams(call.body as string);
		expect(form.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
		expect(form.get('assertion')?.split('.')).toHaveLength(3);
		expect(cred.authenticate.properties.headers).toEqual({ Authorization: '=Bearer {{$credentials.accessToken}}' });
		expect(cred.properties.find((p) => p.name === 'accessToken')?.typeOptions).toMatchObject({ expirable: true });
	});

	it('fails clearly when DocuSign returns no token', async () => {
		const cred = new DocuSignJwtApi();
		const httpRequest = async () => ({});
		await expect(cred.preAuthentication.call({ helpers: { httpRequest } } as never, creds)).rejects.toThrow(
			'did not return an access token',
		);
	});
});

describe('account base URI discovery (H4)', () => {
	it('routes the call to the base_uri DocuSign returns for the account', async () => {
		const ctx = createMockContext({
			credentials: C,
			userInfo: { accounts: [{ account_id: 'acct-eu', base_uri: 'https://eu.docusign.net' }] },
			httpResponses: [{ ok: true }],
		});
		await docuSignRequest(ctx, 'GET', 'accounts/acct-eu/envelopes');
		expect(getRecordedRequests(ctx)[0].options.url).toBe('https://eu.docusign.net/restapi/v2.1/accounts/acct-eu/envelopes');
	});

	it('never follows a base_uri outside docusign.net', async () => {
		expect(toEsignBaseUrl('https://evil.example.com')).toBeUndefined();
		expect(toEsignBaseUrl('http://na2.docusign.net')).toBeUndefined();
		expect(toEsignBaseUrl('https://docusign.net.evil.com')).toBeUndefined();
		const ctx = createMockContext({
			credentials: C,
			userInfo: { accounts: [{ account_id: 'acct-x', base_uri: 'https://evil.example.com' }] },
			httpResponses: [{ ok: true }],
		});
		await docuSignRequest(ctx, 'GET', 'accounts/acct-x');
		expect(getRecordedRequests(ctx)[0].options.url).toBe(`${DEMO}/accounts/acct-x`);
	});

	it('falls back to the environment host when userinfo fails', async () => {
		const ctx = createMockContext({ credentials: C, userInfo: new Error('offline'), httpResponses: [{ ok: true }] });
		await docuSignRequest(ctx, 'GET', 'accounts/acct-y');
		expect(getRecordedRequests(ctx)[0].options.url).toBe(`${DEMO}/accounts/acct-y`);
	});
});

describe('DocuSign Connect trigger (H5, H6, M13)', () => {
	const methods = new DocuSignTrigger().webhookMethods.default;

	function hookCtx(options: IDataObject, responses: unknown[] = [{ connectId: 'c-1' }]) {
		const base = createMockContext({ credentials: C, httpResponses: responses });
		const values: IDataObject = { accountId: 'acct-1', events: ['envelope-sent', 'recipient-completed'], options };
		return Object.assign(base, {
			getWorkflowStaticData: () => ({}),
			getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc',
			getNodeParameter: (name: string, fallback?: unknown) => values[name] ?? fallback,
		}) as unknown as IHookFunctions;
	}

	it('registers modern event names in the events array', async () => {
		const ctx = hookCtx({ hmacSecret: 'key-1' });
		await expect(methods.create.call(ctx)).resolves.toBe(true);
		const body = getRecordedRequests(ctx)[0].options.body as IDataObject;
		expect(body.events).toEqual(['envelope-sent', 'recipient-completed']);
		expect(body).not.toHaveProperty('envelopeEvents');
		expect(body).not.toHaveProperty('recipientEvents');
		expect(body.includeHMAC).toBe('true');
	});

	it('refuses to activate without the Connect HMAC key', async () => {
		const ctx = hookCtx({});
		await expect(methods.create.call(ctx)).rejects.toThrow('Connect Keys');
		expect(getRecordedRequests(ctx)).toHaveLength(0);
	});

	const raw = Buffer.from('{"event":"envelope-sent"}');
	const sign = (key: string) => createHmac('sha256', key).update(raw).digest('base64');

	function webhookCtx(headers: IDataObject, options: IDataObject, rawBody: Buffer | null = raw) {
		const status = jest.fn();
		const json = jest.fn();
		const res = { status: (code: number) => (status(code), { json }) };
		const ctx = {
			getBodyData: () => JSON.parse(raw.toString()),
			getHeaderData: () => headers,
			getNodeParameter: () => options,
			getRequestObject: () => ({ rawBody: rawBody ?? undefined }),
			getResponseObject: () => res,
			getWorkflowStaticData: () => ({}),
			helpers: { returnJsonArray: (d: IDataObject) => [{ json: d }] },
		} as unknown as IWebhookFunctions;
		return { ctx, status };
	}
	const trigger = new DocuSignTrigger();

	it('accepts a match on any signature header, for any configured key', async () => {
		const { ctx } = webhookCtx(
			{ 'x-docusign-signature-1': sign('old-key'), 'x-docusign-signature-2': sign('key-2') },
			{ hmacSecret: 'key-2' },
		);
		const out = await trigger.webhook.call(ctx);
		expect(out.workflowData).toBeDefined();
	});

	it.each([
		['missing signature', {}, { hmacSecret: 'k' }],
		['wrong signature', { 'x-docusign-signature-1': sign('other') }, { hmacSecret: 'k' }],
		['no key configured', { 'x-docusign-signature-1': sign('k') }, {}],
	])('rejects with 401 on %s', async (_name, headers, options) => {
		const { ctx, status } = webhookCtx(headers as IDataObject, options as IDataObject);
		const out = await trigger.webhook.call(ctx);
		expect(out).toEqual({ noWebhookResponse: true });
		expect(status).toHaveBeenCalledWith(401);
	});

	it('rejects when the raw body is unavailable instead of re-serialising', async () => {
		const { ctx, status } = webhookCtx({ 'x-docusign-signature-1': sign('k') }, { hmacSecret: 'k' }, null);
		await trigger.webhook.call(ctx);
		expect(status).toHaveBeenCalledWith(401);
	});

	it('parses rotated keys and ignores blanks', () => {
		expect(parseHmacSecrets(' a , ,b ')).toEqual(['a', 'b']);
		expect(parseHmacSecrets(undefined)).toEqual([]);
		expect(verifyDocuSignSignature(raw, {}, ['a'])).toBe(false);
	});
});

describe('binary downloads return real bytes (H7)', () => {
	it('requests arraybuffer and hands prepareBinaryData a Buffer', async () => {
		const pdf = Uint8Array.from([0x25, 0x50, 0x44, 0x46]).buffer;
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'env-1', documentId: 'combined', binaryPropertyName: 'data' }),
			httpResponses: [pdf],
		});
		const out = (await handleEnvelope(ctx, 'downloadDocuments', 0)) as { binary: Record<string, { data: string }> };
		expect(getRecordedRequests(ctx)[0].options.encoding).toBe('arraybuffer');
		expect(Buffer.from(out.binary.data.data, 'base64').toString()).toBe('%PDF');
	});
});

describe('binary uploads read the stored bytes (H8)', () => {
	const bytes = Buffer.from('%PDF-1.7 real bytes');

	it('envelope create sends the file content, not the storage id', async () => {
		const ctx = withStoredBinary(
			createMockContext({
				credentials: C,
				parameters: params({
					accountId: 'acct-1',
					emailSubject: 'Sign',
					status: 'sent',
					additionalFields: {},
					signers: {},
					documents: { document: [{ name: 'c.pdf', source: 'binary', binaryProperty: 'data', fileExtension: 'pdf' }] },
				}),
				httpResponses: [{ envelopeId: 'e-1' }],
			}),
			bytes,
		);
		await handleEnvelope(ctx, 'create', 0);
		const body = getRecordedRequests(ctx)[0].options.body as { documents: IDataObject[] };
		expect(body.documents[0].documentBase64).toBe(bytes.toString('base64'));
	});

	it('envelope attachments send the file content', async () => {
		const ctx = withStoredBinary(
			createMockContext({
				credentials: C,
				parameters: params({
					accountId: 'acct-1',
					envelopeId: 'env-1',
					attachmentId: 'att-1',
					attachmentName: 'a.pdf',
					attachmentType: 'pdf',
					source: 'binary',
					binaryProperty: 'data',
				}),
				httpResponses: [{}],
			}),
			bytes,
		);
		await handleEnvelopeAttachment(ctx, 'update', 0).catch(() => handleEnvelopeAttachment(ctx, 'create', 0));
		const sent = JSON.stringify(getRecordedRequests(ctx).map((r) => r.options.body));
		expect(sent).toContain(bytes.toString('base64'));
		expect(sent).not.toContain('filesystem-v2');
	});

	it('template create sends the file content', async () => {
		const ctx = withStoredBinary(
			createMockContext({
				credentials: C,
				parameters: params({
					accountId: 'acct-1',
					templateName: 'T',
					additionalFields: {},
					templateDocuments: { document: [{ name: 'c.pdf', source: 'binary', binaryProperty: 'data', fileExtension: 'pdf' }] },
					documents: { document: [{ name: 'c.pdf', source: 'binary', binaryProperty: 'data', fileExtension: 'pdf' }] },
					signers: {},
					templateRoles: {},
					emailSubject: 'S',
					name: 'T',
					description: '',
				}),
				httpResponses: [{ templateId: 't-1' }],
			}),
			bytes,
		);
		await handleTemplate(ctx, 'create', 0);
		const sent = JSON.stringify(getRecordedRequests(ctx)[0].options.body);
		expect(sent).toContain(bytes.toString('base64'));
		expect(sent).not.toContain('filesystem-v2');
	});
});

describe('retries (M9)', () => {
	const apiError = (code: string) =>
		Object.assign(new Error('x'), { httpCode: code, response: { headers: { 'retry-after': '1' } } });

	it('retries a NodeApiError-style httpCode on GET', async () => {
		const ctx = createMockContext({ credentials: C, httpResponses: [apiError('503'), { ok: true }] });
		await expect(docuSignRequest(ctx, 'GET', 'accounts/a')).resolves.toEqual({ ok: true });
	});

	it('does not repeat a POST after a 5xx, which may already have created the envelope', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [createHttpError(502, {}, 'bad gateway', { 'retry-after': '1' }), { ok: true }],
		});
		await expect(docuSignRequest(ctx, 'POST', 'accounts/a/envelopes', { a: 1 })).rejects.toThrow('[502]');
		expect(getRecordedRequests(ctx)).toHaveLength(1);
	});

	it('repeats a POST after 429, which DocuSign rejects before processing', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [createHttpError(429, {}, 'slow down', { 'retry-after': '1' }), { ok: true }],
		});
		await expect(docuSignRequest(ctx, 'POST', 'accounts/a/envelopes', { a: 1 })).resolves.toEqual({ ok: true });
	});
});

describe('chunked upload routes (M10)', () => {
	it('uploads a part as JSON base64 to /{id}/{seq}', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', chunkedUploadId: 'cu-1', chunkIndex: 2, inputDataSource: 'base64', base64Data: 'QUJD' }),
			httpResponses: [{}],
		});
		await handleChunkedUpload(ctx, 'update', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.url).toBe(`${DEMO}/accounts/acct-1/chunked_uploads/cu-1/2`);
		expect(req.body).toEqual({ chunkedUploadId: 'cu-1', data: 'QUJD' });
		expect(req.json).toBe(true);
	});

	it('commits with ?action=commit', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', chunkedUploadId: 'cu-1' }), httpResponses: [{}] });
		await handleChunkedUpload(ctx, 'commit', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.method).toBe('PUT');
		expect(req.url).toBe(`${DEMO}/accounts/acct-1/chunked_uploads/cu-1`);
		expect(req.qs).toEqual({ action: 'commit' });
	});
});

describe('console view route (M11)', () => {
	it('POSTs to the account-level views/console', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'env-1', returnUrl: 'https://x.example.com', viewOptions: {} }),
			httpResponses: [{ url: 'u' }],
		});
		await handleEnvelopeView(ctx, 'createConsole', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.url).toBe(`${DEMO}/accounts/acct-1/views/console`);
		expect(req.body).toEqual({ returnUrl: 'https://x.example.com', envelopeId: 'env-1' });
	});
});

describe('user authorization list routes (M12)', () => {
	it.each([
		['getPrincipalUserAuthorizations', `${DEMO}/accounts/acct-1/users/u-1/authorizations`],
		['getAgentUserAuthorizations', `${DEMO}/accounts/acct-1/users/u-1/authorizations/agent`],
	])('%s calls %s', async (op, url) => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', userId: 'u-1' }), httpResponses: [{}] });
		await handleAuthorization(ctx, op, 0);
		expect(getRecordedRequests(ctx)[0].options.url).toBe(url);
	});
});

describe('errors keep their item index (L16)', () => {
	it('tags the API error with the failing item', async () => {
		const node = new DocuSign();
		const ctx = createMockContext({
			parameters: {
				resource: { 0: 'envelope', 1: 'envelope' },
				operation: { 0: 'get', 1: 'get' },
				accountId: { 0: 'acct-1', 1: 'acct-1' },
				envelopeId: { 0: 'env-1', 1: 'env-2' },
			},
			inputData: [{ json: {} }, { json: {} }],
			credentials: C,
			httpResponses: [{ envelopeId: 'env-1' }, createHttpError(404, { errorCode: 'NOT_FOUND', message: 'gone' })],
		});
		const error = (await node.execute.call(ctx).catch((e: unknown) => e)) as NodeApiError;
		expect(error).toBeInstanceOf(NodeApiError);
		expect(error.context.itemIndex).toBe(1);
		expect(error.message).toBe('DocuSign API error [404]');
	});
});

// Round 2: findings from the Codex re-review of 2.0.0.

describe('round 2: trigger Connect lookup and documents', () => {
	const methods = new DocuSignTrigger().webhookMethods.default;
	const hook = (responses: unknown[], options: IDataObject = { hmacSecret: 'k' }) =>
		Object.assign(createMockContext({ credentials: C, httpResponses: responses }), {
			getWorkflowStaticData: () => ({ connectId: 'c-1' }),
			getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc',
			getNodeParameter: (name: string, fallback?: unknown) =>
				(({ accountId: 'acct-1', events: ['envelope-completed'], options }) as IDataObject)[name] ?? fallback,
			logger: { warn: jest.fn() },
		}) as unknown as IHookFunctions;

	it('recognises an existing configuration in the configurations array', async () => {
		const ctx = hook([{ configurations: [{ connectId: 'c-1', urlToPublishTo: 'https://n8n.example.com/webhook/abc' }] }]);
		await expect(methods.checkExists.call(ctx)).resolves.toBe(true);
	});

	it('asks for documents in eventData when Include Documents is on', async () => {
		const ctx = hook([{ connectId: 'c-2' }], { hmacSecret: 'k', includeDocuments: true });
		await methods.create.call(ctx);
		const body = getRecordedRequests(ctx)[0].options.body as { eventData: { includeData: string[] } };
		expect(body.eventData.includeData).toContain('documents');
	});
});

describe('round 2: recipients and SMS', () => {
	it('recipient update sends access code, client user id, SMS and notification', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({
				accountId: 'acct-1',
				envelopeId: 'env-1',
				recipientType: 'signers',
				recipientId: '1',
				updateFields: { accessCode: '1234', clientUserId: 'cu', deliveryMethod: 'sms', emailNotificationSubject: 'Hi' },
			}),
			httpResponses: [{}],
		});
		await handleRecipient(ctx, 'update', 0);
		const body = getRecordedRequests(ctx)[0].options.body as { signers: IDataObject[] };
		expect(body.signers[0]).toEqual({
			recipientId: '1',
			accessCode: '1234',
			clientUserId: 'cu',
			deliveryMethod: 'SMS',
			emailNotification: { emailSubject: 'Hi' },
		});
	});

	it('envelope signers send the DocuSign phone shape', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({
				accountId: 'acct-1',
				emailSubject: 'S',
				status: 'sent',
				additionalFields: {},
				documents: {},
				signers: { signer: [{ email: 'a@example.com', name: 'A', deliveryMethod: 'sms', phoneNumber: '+1 415 555 0100' }] },
			}),
			httpResponses: [{}],
		});
		await handleEnvelope(ctx, 'create', 0);
		const body = getRecordedRequests(ctx)[0].options.body as { recipients: { signers: IDataObject[] } };
		expect(body.recipients.signers[0]).toMatchObject({
			deliveryMethod: 'SMS',
			phoneNumber: { countryCode: '1', number: '4155550100' },
		});
	});
});

describe('round 2: routes and bodies from the v2.1 spec', () => {
	it('template document delete sends the ID list to .../documents', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', templateId: 't-1', documentId: '3' }), httpResponses: [{}] });
		await handleTemplateDocument(ctx, 'delete', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.url).toBe(`${DEMO}/accounts/acct-1/templates/t-1/documents`);
		expect(req.body).toEqual({ documents: [{ documentId: '3' }] });
	});

	it('template recipient preview posts to the template views', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', templateId: 't-1', returnUrl: 'https://x.example.com' }), httpResponses: [{}] });
		await handleTemplateRecipient(ctx, 'createPreview', 0);
		expect(getRecordedRequests(ctx)[0].options.url).toBe(`${DEMO}/accounts/acct-1/templates/t-1/views/recipient_preview`);
	});

	it('historical publish posts to connect/envelopes/publish/historical', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', requestBody: '{"envelopes":[]}' }), httpResponses: [{}] });
		await handleEnvelopePublish(ctx, 'createHistorical', 0);
		expect(getRecordedRequests(ctx)[0].options.url).toBe(`${DEMO}/accounts/acct-1/connect/envelopes/publish/historical`);
	});

	it('contact create and update use contactList', async () => {
		const create = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', contactName: 'A', name: 'A', additionalFields: {} }),
			httpResponses: [{}],
		});
		await handleUserContact(create, 'create', 0);
		expect(Object.keys(getRecordedRequests(create)[0].options.body as IDataObject)).toEqual(['contactList']);
		const update = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', contactsBody: '[{"contactId":"c-1","name":"B"}]' }),
			httpResponses: [{}],
		});
		await handleUserContact(update, 'update', 0);
		expect(getRecordedRequests(update)[0].options.body).toEqual({ contactList: [{ contactId: 'c-1', name: 'B' }] });
	});

	it.each([
		['envelope', handleEnvelopeLock, { envelopeId: 'env-1' }],
		['template', handleTemplateLock, { templateId: 't-1' }],
	])('%s lock update and release send X-DocuSign-Edit', async (_kind, handler, ids) => {
		for (const op of ['update', 'delete']) {
			const ctx = createMockContext({
				credentials: C,
				parameters: params({ accountId: 'acct-1', ...ids, lockToken: 'tok-9', lockDurationInSeconds: 600 }),
				httpResponses: [{}],
			});
			await (handler as (c: IExecuteFunctions, o: string, i: number) => Promise<unknown>)(ctx, op, 0);
			const req = getRecordedRequests(ctx)[0].options as { headers: Record<string, string>; body?: IDataObject };
			expect(JSON.parse(req.headers['X-DocuSign-Edit']).LockToken).toBe('tok-9');
			expect(req.body ?? {}).not.toHaveProperty('lockToken');
		}
	});
});

describe('round 3: envelope update sends every offered field', () => {
	const run = (updateFields: IDataObject) =>
		createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'env-1', updateFields }),
			httpResponses: [{}],
		});

	it('maps purge state, status, void reason, locks and brand', async () => {
		const ctx = run({
			purgeState: 'documents_queued',
			status: 'voided',
			voidedReason: 'Wrong file',
			messageLock: 'true',
			recipientsLock: 'false',
			brandId: 'b-1',
			emailSubject: 'S',
		});
		await handleEnvelope(ctx, 'update', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({
			emailSubject: 'S',
			brandId: 'b-1',
			purgeState: 'documents_queued',
			status: 'voided',
			voidedReason: 'Wrong file',
			messageLock: 'true',
			recipientsLock: 'false',
		});
	});

	it('requires a void reason before voiding', async () => {
		const ctx = run({ status: 'voided' });
		await expect(handleEnvelope(ctx, 'update', 0)).rejects.toThrow('Voided Reason is required');
		expect(getRecordedRequests(ctx)).toHaveLength(0);
	});
});

describe('round 3: Connect HMAC key lives in a credential', () => {
	const raw = Buffer.from('{"event":"envelope-sent"}');
	const sign = (key: string) => createHmac('sha256', key).update(raw).digest('base64');
	const trigger = new DocuSignTrigger();

	function ctxWith(credentialKey: string | undefined, optionKey: string | undefined, signature: string) {
		const status = jest.fn();
		return {
			status,
			ctx: {
				getBodyData: () => JSON.parse(raw.toString()),
				getHeaderData: () => ({ 'x-docusign-signature-1': signature }),
				getNodeParameter: () => (optionKey ? { hmacSecret: optionKey } : {}),
				getCredentials: async (type: string) => {
					if (type === 'docuSignConnectHmacApi' && credentialKey) return { hmacSecret: credentialKey };
					throw new Error('not set');
				},
				getRequestObject: () => ({ rawBody: raw }),
				getResponseObject: () => ({ status: (c: number) => (status(c), { json: jest.fn() }) }),
				helpers: { returnJsonArray: (d: IDataObject) => [{ json: d }] },
			} as unknown as IWebhookFunctions,
		};
	}

	it('the credential exists as an encrypted password field', () => {
		const cred = new DocuSignConnectHmacApi();
		expect(cred.name).toBe('docuSignConnectHmacApi');
		expect(cred.properties[0]).toMatchObject({ name: 'hmacSecret', typeOptions: { password: true } });
		const node = new DocuSignTrigger().description;
		expect(node.credentials?.find((c) => c.name === 'docuSignConnectHmacApi')).toBeDefined();
		expect(node.properties.find((p) => p.name === 'options')).toBeDefined();
	});

	it('verifies with the credential key, which wins over the old option', async () => {
		const { ctx } = ctxWith('cred-key', 'old-key', sign('cred-key'));
		expect((await trigger.webhook.call(ctx)).workflowData).toBeDefined();
		const { ctx: ctx2, status } = ctxWith('cred-key', 'old-key', sign('old-key'));
		await trigger.webhook.call(ctx2);
		expect(status).toHaveBeenCalledWith(401);
	});

	it('falls back to the deprecated option for existing workflows', async () => {
		const { ctx } = ctxWith(undefined, 'old-key', sign('old-key'));
		expect((await trigger.webhook.call(ctx)).workflowData).toBeDefined();
	});
});

describe('round 3: trigger keeps track of its subscription', () => {
	const methods = new DocuSignTrigger().webhookMethods.default;
	const hook = (responses: unknown[], staticData: IDataObject) =>
		Object.assign(createMockContext({ credentials: C, httpResponses: responses }), {
			getWorkflowStaticData: () => staticData,
			getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc',
			getNodeParameter: () => 'acct-1',
			logger: { warn: jest.fn() },
		}) as unknown as IHookFunctions;

	it('raises a transient lookup failure instead of reporting the subscription missing', async () => {
		await expect(methods.checkExists.call(hook([createHttpError(500)], { connectId: 'c-1' }))).rejects.toThrow();
	});

	it('keeps the stored ID when delete fails for a reason other than 404', async () => {
		const staticData: IDataObject = { connectId: 'c-1' };
		await expect(methods.delete.call(hook([createHttpError(500)], staticData))).resolves.toBe(false);
		expect(staticData.connectId).toBe('c-1');
	});
});

describe('round 3: writes are not repeated after a 5xx', () => {
	it('does not retry a PUT that may already have added an attachment', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [createHttpError(502, {}, 'bad gateway', { 'retry-after': '1' }), { ok: true }],
		});
		await expect(docuSignRequest(ctx, 'PUT', 'accounts/a/envelopes/e/attachments', { a: 1 })).rejects.toThrow('[502]');
		expect(getRecordedRequests(ctx)).toHaveLength(1);
	});
});

describe('round 3: routes from the v2.1 spec', () => {
	const urlOf = (ctx: IExecuteFunctions) => getRecordedRequests(ctx)[0].options.url;

	it('folder list items is GET folders/{folderId}', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', folderId: 'f-1', filters: {} }), httpResponses: [{}] });
		await handleFolder(ctx, 'listItems', 0);
		expect(urlOf(ctx)).toBe(`${DEMO}/accounts/acct-1/folders/f-1`);
	});

	it('workspace folder list and delete use the folder URL', async () => {
		const base = { accountId: 'acct-1', workspaceId: 'w-1', folderId: 'f-1' };
		const list = createMockContext({ credentials: C, parameters: params({ ...base, filters: {} }), httpResponses: [{}] });
		await handleWorkspaceItem(list, 'listFolderItems', 0);
		expect(urlOf(list)).toBe(`${DEMO}/accounts/acct-1/workspaces/w-1/folders/f-1`);
		const del = createMockContext({ credentials: C, parameters: params({ ...base, itemsJson: '[{"itemId":"i-1"}]' }), httpResponses: [{}] });
		await handleWorkspaceItem(del, 'deleteFolderItems', 0);
		expect(urlOf(del)).toBe(`${DEMO}/accounts/acct-1/workspaces/w-1/folders/f-1`);
		expect(getRecordedRequests(del)[0].options.body).toEqual({ items: [{ itemId: 'i-1' }] });
	});

	it('user profile image uses users/{id}/profile/image', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', userId: 'u-1' }), httpResponses: [{}] });
		await handleUser(ctx, 'deleteProfileImage', 0);
		expect(urlOf(ctx)).toBe(`${DEMO}/accounts/acct-1/users/u-1/profile/image`);
	});

	it('attachment delete sends the ID list to .../attachments', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', attachmentId: 'a-1' }), httpResponses: [{}] });
		await handleEnvelopeAttachment(ctx, 'delete', 0);
		expect(urlOf(ctx)).toBe(`${DEMO}/accounts/acct-1/envelopes/e-1/attachments`);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({ attachments: [{ attachmentId: 'a-1' }] });
	});

	it('attachment get returns the file as binary', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', attachmentId: 'a-1' }),
			httpResponses: [Uint8Array.from([1, 2, 3]).buffer],
			typeVersion: 2,
		});
		const out = (await handleEnvelopeAttachment(ctx, 'get', 0)) as { binary: { data: { data: string } } };
		expect(getRecordedRequests(ctx)[0].options.encoding).toBe('arraybuffer');
		expect(Buffer.from(out.binary.data.data, 'base64')).toEqual(Buffer.from([1, 2, 3]));
	});

	it('envelope template delete is scoped to the document', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', templateId: 't-1', documentId: '2' }), httpResponses: [{}] });
		await handleEnvelopeTemplate(ctx, 'delete', 0);
		expect(urlOf(ctx)).toBe(`${DEMO}/accounts/acct-1/envelopes/e-1/documents/2/templates/t-1`);
		const field = new DocuSign().description.properties.find(
			(p) => p.name === 'documentId' && (p.displayOptions?.show?.resource as string[] | undefined)?.includes('envelopeTemplate'),
		);
		expect(field?.displayOptions?.show?.operation).toContain('delete');
	});

	it('envelope comments come from the PDF transcript', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', envelopeId: 'e-1' }), httpResponses: [Buffer.from('%PDF')] });
		const out = (await handleEnvelopeComment(ctx, 'get', 0)) as { binary: { data: { mimeType: string } } };
		expect(urlOf(ctx)).toBe(`${DEMO}/accounts/acct-1/envelopes/e-1/comments/transcript`);
		expect(out.binary.data.mimeType).toBe('application/pdf');
	});

	it('password rules for a user use current_user/password_rules', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', userId: 'u-1' }), httpResponses: [{}] });
		await handleAccountPasswordRule(ctx, 'getForUser', 0);
		expect(urlOf(ctx)).toBe(`${DEMO}/current_user/password_rules`);
	});

	it('diagnostics call /restapi/service_information and /restapi/v2.1', async () => {
		const svc = createMockContext({ credentials: C, httpResponses: [{}] });
		await handleDiagnosticService(svc, 'get', 0);
		expect(urlOf(svc)).toBe('https://demo.docusign.net/restapi/service_information');
		const res = createMockContext({ credentials: C, httpResponses: [{}] });
		await handleDiagnosticResource(res, 'get', 0);
		expect(urlOf(res)).toBe(DEMO);
	});
});

describe('round 3: notification and delivery shapes', () => {
	it('notification update nests expirations and reminders', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({
				accountId: 'acct-1',
				envelopeId: 'e-1',
				notificationSettings: { expireAfter: 30, expireEnabled: 'true', reminderDelay: 2, reminderEnabled: 'true', reminderFrequency: 3 },
			}),
			httpResponses: [{}],
		});
		await handleEnvelope(ctx, 'updateNotificationSettings', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({
			expirations: { expireAfter: '30', expireEnabled: 'true' },
			reminders: { reminderDelay: '2', reminderEnabled: 'true', reminderFrequency: '3' },
		});
	});

	it('an explicit Email delivery switches an SMS recipient back', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientType: 'signers', recipientId: '1', updateFields: { deliveryMethod: 'email' } }),
			httpResponses: [{}],
		});
		await handleRecipient(ctx, 'update', 0);
		expect((getRecordedRequests(ctx)[0].options.body as { signers: IDataObject[] }).signers[0].deliveryMethod).toBe('email');
	});
});

describe('round 3: HMAC credential test', () => {
	it('accepts a key and rejects an empty one', async () => {
		const test = new DocuSignTrigger().methods.credentialTest.docuSignConnectHmacTest;
		const ok = await test.call({} as never, { data: { hmacSecret: 'a,b' } } as never);
		expect(ok.status).toBe('OK');
		const bad = await test.call({} as never, { data: { hmacSecret: '' } } as never);
		expect(bad.status).toBe('Error');
	});
});

describe('round 4: Connect configuration', () => {
	it('update is PUT /connect with the connectId in the body', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', connectId: 'c-9', requestBody: '{"name":"renamed"}' }),
			httpResponses: [{}],
		});
		await handleConnectConfiguration(ctx, 'update', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.method).toBe('PUT');
		expect(req.url).toBe(`${DEMO}/accounts/acct-1/connect`);
		expect(req.body).toEqual({ name: 'renamed', connectId: 'c-9' });
	});

	it('publish to Connect is a POST', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', requestBody: '{"envelopes":[]}' }), httpResponses: [{}] });
		await handleConnectConfiguration(ctx, 'publishToConnect', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.method).toBe('POST');
		expect(req.url).toBe(`${DEMO}/accounts/acct-1/connect/envelopes/publish/historical`);
	});
});

describe('round 4: tab updates can clear values', () => {
	const tab = { documentId: '1', pageNumber: '1', tabId: 't-1', value: '', locked: 'false', required: 'false', bold: 'false', tabLabel: '' };
	it.each([
		['envelope', handleEnvelopeRecipientTab, { envelopeId: 'e-1' }],
		['template', handleTemplateRecipientTab, { templateId: 'tp-1' }],
	])('%s: Send Empty and No Values sends cleared text and No flags', async (_k, handler, ids) => {
		const run = async (sendEmptyValues: boolean) => {
			const ctx = createMockContext({
				credentials: C,
				parameters: params({ accountId: 'acct-1', ...ids, recipientId: '1', tabType: 'textTabs', tabs: { tab: [tab] }, sendEmptyValues }),
				httpResponses: [{}],
			});
			await (handler as (c: IExecuteFunctions, o: string, i: number) => Promise<unknown>)(ctx, 'update', 0);
			return (getRecordedRequests(ctx)[0].options.body as { textTabs: IDataObject[] }).textTabs[0];
		};
		expect(await run(true)).toMatchObject({ tabId: 't-1', value: '', locked: 'false', required: 'false', bold: 'false', tabLabel: '' });
		// Off (the default) keeps the earlier behaviour: only filled-in fields are sent.
		const off = await run(false);
		expect(off).not.toHaveProperty('locked');
		expect(off).not.toHaveProperty('value');
	});
});

describe('round 4: SMS on every recipient form', () => {
	it('template recipient create and update send SMS with the phone shape', async () => {
		for (const [op, extra] of [
			['create', { roleName: 'R', routingOrder: '1', additionalFields: { deliveryMethod: 'sms', phoneNumber: '+44 7700900123' } }],
			['update', { recipientId: '1', updateFields: { deliveryMethod: 'sms', phoneNumber: '+44 7700900123' } }],
		] as const) {
			const ctx = createMockContext({
				credentials: C,
				parameters: params({ accountId: 'acct-1', templateId: 'tp-1', recipientType: 'signers', ...extra }),
				httpResponses: [{}],
			});
			await handleTemplateRecipient(ctx, op, 0);
			expect((getRecordedRequests(ctx)[0].options.body as { signers: IDataObject[] }).signers[0]).toMatchObject({
				deliveryMethod: 'SMS',
				phoneNumber: { countryCode: '44', number: '7700900123' },
			});
		}
	});

	it('envelope recipient update accepts a phone number', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientType: 'signers', recipientId: '1', updateFields: { deliveryMethod: 'sms', phoneNumber: '+1 4155550100' } }),
			httpResponses: [{}],
		});
		await handleRecipient(ctx, 'update', 0);
		expect((getRecordedRequests(ctx)[0].options.body as { signers: IDataObject[] }).signers[0].phoneNumber).toEqual({ countryCode: '1', number: '4155550100' });
		const field = new DocuSign().description.properties.find((p) => p.name === 'updateFields' && (p.displayOptions?.show?.resource as string[]).includes('recipient'));
		expect(JSON.stringify(field)).toContain('"phoneNumber"');
	});
});

describe('round 4: Group Get Many reaches every page', () => {
	it('Return All follows start_position across pages', async () => {
		const page = (start: number, n: number, more: boolean) => ({
			groups: Array.from({ length: n }, (_, k) => ({ groupId: String(start + k) })),
			resultSetSize: String(n),
			totalSetSize: '150',
			...(more ? { nextUri: '/next' } : {}),
		});
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', returnAll: true, groupFilters: {} }),
			httpResponses: [page(0, 100, true), page(100, 50, false)],
		});
		const groups = (await handleGroup(ctx, 'list', 0)) as IDataObject[];
		expect(groups).toHaveLength(150);
		expect(getRecordedRequests(ctx).map((r) => (r.options.qs as IDataObject).start_position)).toEqual(['0', '100']);
	});

	it('the default stays one request with no query', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1' }), httpResponses: [{ groups: [] }] });
		await handleGroup(ctx, 'list', 0);
		expect(getRecordedRequests(ctx)).toHaveLength(1);
		expect(getRecordedRequests(ctx)[0].options.qs).toBeUndefined();
	});

	it('manual paging sends count and start_position', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', returnAll: false, groupFilters: { count: 100, startPosition: 200, groupType: 'CustomGroup' } }), httpResponses: [{}] });
		await handleGroup(ctx, 'list', 0);
		expect(getRecordedRequests(ctx)[0].options.qs).toEqual({ count: '100', start_position: '200', group_type: 'CustomGroup' });
	});
});

describe('round 4: envelope operations are in the picker', () => {
	it.each(['getNotificationSettings', 'listAuditEvents', 'listStatusChanges', 'updateNotificationSettings'])('%s is selectable', (op) => {
		const picker = new DocuSign().description.properties.find(
			(p) => p.name === 'operation' && (p.displayOptions?.show?.resource as string[]).includes('envelope'),
		);
		expect((picker?.options as Array<{ value: string }>).map((o) => o.value)).toContain(op);
	});

	it('List Status Changes maps the filters to DocuSign query names', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', filters: { fromDate: '2026-01-01T00:00:00Z', status: ['sent', 'completed'] } }),
			httpResponses: [{}],
		});
		await handleEnvelope(ctx, 'listStatusChanges', 0);
		expect(getRecordedRequests(ctx)[0].options.qs).toEqual({ from_date: '2026-01-01T00:00:00Z', status: 'sent,completed' });
	});
});

describe('round 4: node versions keep saved workflows stable', () => {
	it('the node offers versions 1 and 2, new nodes get 2', () => {
		const d = new DocuSign().description;
		expect(d.version).toEqual([1, 2]);
		expect(d.defaultVersion).toBe(2);
	});

	it('version 1 Attachment Get returns the JSON response as before', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', attachmentId: 'a-1' }),
			httpResponses: [{ attachmentId: 'a-1', name: 'x' }],
		});
		expect(await handleEnvelopeAttachment(ctx, 'get', 0)).toEqual({ attachmentId: 'a-1', name: 'x' });
		expect(getRecordedRequests(ctx)[0].options.encoding).toBeUndefined();
	});
});

describe('round 4: request bodies the spec defines', () => {
	it.each([
		['envelope', handleEnvelopeCustomField, { envelopeId: 'e-1' }, '/envelopes/e-1/custom_fields'],
		['template', handleTemplateCustomField, { templateId: 'tp-1' }, '/templates/tp-1/custom_fields'],
	])('%s custom field delete sends the field ID list', async (_k, handler, ids, path) => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', ...ids, customFieldId: 'f-1' }), httpResponses: [{}] });
		await (handler as (c: IExecuteFunctions, o: string, i: number) => Promise<unknown>)(ctx, 'delete', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.url).toBe(`${DEMO}/accounts/acct-1${path}`);
		expect(req.body).toEqual({ textCustomFields: [{ fieldId: 'f-1' }], listCustomFields: [{ fieldId: 'f-1' }] });
	});

	it('recipient names by email use the v2 API, the only version that has it', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', email: 'a@example.com' }), httpResponses: [{}] });
		await handleAccount(ctx, 'listRecipientNamesByEmail', 0);
		expect(getRecordedRequests(ctx)[0].options.url).toBe('https://demo.docusign.net/restapi/v2/accounts/acct-1/recipient_names');
	});

	it('billing purchase sends the JSON body to POST billing_plan/purchased_envelopes', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', requestBody: '{"amount":"100","quantity":"50"}' }), httpResponses: [{}] });
		await handleBillingPlan(ctx, 'purchaseEnvelopes', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(matchSpecRoute(String(req.method), String(req.url))).toBe('/v2.1/accounts/{accountId}/billing_plan/purchased_envelopes');
		expect(req.body).toEqual({ amount: '100', quantity: '50' });
	});

	it('recipient add rejects an unsafe recipient ID', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientType: 'signers', recipientEmail: 'a@example.com', recipientName: 'A', recipientId: '1/../2', additionalFields: {} }),
			httpResponses: [{}],
		});
		await expect(handleRecipient(ctx, 'add', 0)).rejects.toThrow('Recipient ID contains invalid characters');
	});
});

describe('round 4: the spec route check and the CI scanner', () => {
	it('the route check can fail', () => {
		expect(matchSpecRoute('PUT', `${DEMO}/accounts/a/connect/c-1`)).toBeUndefined();
		expect(matchSpecRoute('PUT', `${DEMO}/accounts/a/connect`)).toBe('/v2.1/accounts/{accountId}/connect');
	});

	it('CI and publish run the pinned n8n scanner on source and package', () => {
		for (const wf of ['.github/workflows/ci.yml', '.github/workflows/publish.yml']) {
			expect(readFileSync(wf, 'utf8')).toContain('npm run lint:n8n');
		}
		const script = readFileSync('scripts/n8n-scan.mjs', 'utf8');
		expect(script).toContain("'@n8n/scan-community-package@0.41.1'");
		expect(script).toContain('analyzePackage(root, SOURCE_FILE_PATTERNS)');
		expect(JSON.parse(readFileSync('package.json', 'utf8')).scripts['lint:n8n']).toBe('node scripts/n8n-scan.mjs');
	});

	it('the README no longer claims every ID is validated', () => {
		const readme = readFileSync('README.md', 'utf8');
		expect(readme).not.toMatch(/every ID is validated/i);
	});
});

describe('README operations table matches the picker', () => {
	const { CATEGORY_RESOURCES } = jest.requireActual<typeof import('../nodes/DocuSign/utils/descriptions')>(
		'../nodes/DocuSign/utils/descriptions',
	);
	const resources = Object.values(CATEGORY_RESOURCES).flat() as Array<{ name: string; value: string }>;
	const rows = readFileSync('README.md', 'utf8')
		.split('\n')
		.filter((l) => /^\| [^|]+ \| [^|]+ \| [^|]+ \|$/.test(l) && !l.includes('---'))
		.map((l) => l.split('|').map((c) => c.trim()))
		.map((c) => ({ resource: c[2], ops: c[3].split(', ').sort() }));

	it.each(resources.map((r) => [r.name, r.value]))('%s', (name, value) => {
		const picker = new DocuSign().description.properties.find(
			(p) => p.name === 'operation' && (p.displayOptions?.show?.resource as string[]).includes(value),
		);
		const ops = ((picker?.options ?? []) as Array<{ name: string }>).map((o) => o.name).sort();
		const row = rows.find((r) => r.resource === name);
		expect(row?.ops).toEqual(ops);
	});
});
