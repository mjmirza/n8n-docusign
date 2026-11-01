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
