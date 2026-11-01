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
import { DocuSign, isEmptyListResponse } from '../nodes/DocuSign/DocuSign.node';
import {
	DocuSignTrigger,
	verifyDocuSignSignature,
	parseHmacSecrets,
	matchesSubscription,
} from '../nodes/DocuSign/DocuSignTrigger.node';
import { DocuSignJwtApi, buildDocuSignJwtAssertion } from '../credentials/DocuSignJwtApi.credentials';
import { handleRecipient } from '../nodes/DocuSign/resources/recipient/recipient.handler';
import { handleTemplateDocument } from '../nodes/DocuSign/resources/templateDocument/templateDocument.handler';
import { handleAccountPermissionProfile } from '../nodes/DocuSign/resources/accountPermissionProfile/accountPermissionProfile.handler';
import { handleAccountTabSetting } from '../nodes/DocuSign/resources/accountTabSetting/accountTabSetting.handler';
import { handleBulkEnvelope } from '../nodes/DocuSign/resources/bulkEnvelope/bulkEnvelope.handler';
import { handleEnvelopeWorkflow } from '../nodes/DocuSign/resources/envelopeWorkflow/envelopeWorkflow.handler';
import { parseJsonInput } from '../nodes/DocuSign/utils/jsonInput';
import { handlePowerForm } from '../nodes/DocuSign/resources/powerForm/powerForm.handler';
import { handleAccountCustomField } from '../nodes/DocuSign/resources/accountCustomField/accountCustomField.handler';
import { handleENoteConfiguration } from '../nodes/DocuSign/resources/eNoteConfiguration/eNoteConfiguration.handler';
import { handleTemplateRecipient } from '../nodes/DocuSign/resources/templateRecipient/templateRecipient.handler';
import { handleEnvelopePublish } from '../nodes/DocuSign/resources/envelopePublish/envelopePublish.handler';
import { handleUserContact } from '../nodes/DocuSign/resources/userContact/userContact.handler';
import { handleEnvelopeLock } from '../nodes/DocuSign/resources/envelopeLock/envelopeLock.handler';
import { handleTemplateLock } from '../nodes/DocuSign/resources/templateLock/templateLock.handler';
import { handleFolder } from '../nodes/DocuSign/resources/folder/folder.handler';
import { handleWorkspaceItem } from '../nodes/DocuSign/resources/workspaceItem/workspaceItem.handler';
import { handleUser } from '../nodes/DocuSign/resources/user/user.handler';
import { handleAccountBrand } from '../nodes/DocuSign/resources/accountBrand/accountBrand.handler';
import { handleUserProfile } from '../nodes/DocuSign/resources/userProfile/userProfile.handler';
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
import { matchSpecRoute, unknownBodyKeys, unknownQueryParams } from './setup/spec-routes';
import { toRecipientPhone } from '../nodes/DocuSign/utils/recipientDelivery';
import { readFileSync, readdirSync } from 'fs';

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

	// A signed event from this trigger's own subscription: a subscribed event and its configurationId.
	const raw = Buffer.from('{"event":"envelope-sent","configurationId":"c-1"}');
	const sign = (key: string) => createHmac('sha256', key).update(raw).digest('base64');

	function webhookCtx(headers: IDataObject, options: IDataObject, rawBody: Buffer | null = raw) {
		const status = jest.fn();
		const json = jest.fn();
		const res = { status: (code: number) => (status(code), { json }) };
		const ctx = {
			getBodyData: () => JSON.parse(raw.toString()),
			getHeaderData: () => headers,
			getNodeParameter: (name: string) => (name === 'events' ? ['envelope-sent'] : options),
			getRequestObject: () => ({ rawBody: rawBody ?? undefined }),
			getResponseObject: () => res,
			getWorkflowStaticData: () => ({ connectId: 'c-1' }),
			getNode: () => ({ credentials: {} }),
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
		await expect(docuSignRequest(ctx, 'POST', 'accounts/a/envelopes', { emailSubject: 's' })).rejects.toThrow('[502]');
		expect(getRecordedRequests(ctx)).toHaveLength(1);
	});

	it('repeats a POST after 429, which DocuSign rejects before processing', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [createHttpError(429, {}, 'slow down', { 'retry-after': '1' }), { ok: true }],
		});
		await expect(docuSignRequest(ctx, 'POST', 'accounts/a/envelopes', { emailSubject: 's' })).resolves.toEqual({ ok: true });
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
		const ctx = hook([{ configurations: [{ connectId: 'c-1', urlToPublishTo: 'https://n8n.example.com/webhook/abc', events: ['envelope-completed'] }] }]);
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
	// A signed event from this trigger's own subscription: a subscribed event and its configurationId.
	const raw = Buffer.from('{"event":"envelope-sent","configurationId":"c-1"}');
	const sign = (key: string) => createHmac('sha256', key).update(raw).digest('base64');
	const trigger = new DocuSignTrigger();

	function ctxWith(credentialKey: string | undefined, optionKey: string | undefined, signature: string) {
		const status = jest.fn();
		return {
			status,
			ctx: {
				getBodyData: () => JSON.parse(raw.toString()),
				getHeaderData: () => ({ 'x-docusign-signature-1': signature }),
				getNodeParameter: (name: string) => (name === 'events' ? ['envelope-sent'] : optionKey ? { hmacSecret: optionKey } : {}),
				getCredentials: async (type: string) => {
					if (type === 'docuSignConnectHmacApi' && credentialKey) return { hmacSecret: credentialKey };
					throw new Error('not set');
				},
				getRequestObject: () => ({ rawBody: raw }),
				getResponseObject: () => ({ status: (c: number) => (status(c), { json: jest.fn() }) }),
				getWorkflowStaticData: () => ({ connectId: 'c-1' }),
				getNode: () => ({ credentials: credentialKey ? { docuSignConnectHmacApi: { id: '1', name: 'HMAC' } } : {} }),
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
			getNodeParameter: (name: string) => (name === 'options' ? { hmacSecret: 'k' } : 'acct-1'),
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
		await expect(docuSignRequest(ctx, 'PUT', 'accounts/a/envelopes/e/attachments', { attachments: [] })).rejects.toThrow('[502]');
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
		// DocuSign's workspaceItem key is id; the older itemId input is converted.
		expect(getRecordedRequests(del)[0].options.body).toEqual({ items: [{ id: 'i-1' }] });
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
	it('the node offers versions 1 to 4, new nodes get 4; saved versions stay', () => {
		const d = new DocuSign().description;
		expect(d.version).toEqual([1, 2, 3, 4]);
		expect(d.defaultVersion).toBe(4);
	});

	it('version 1 Attachment Get keeps the binary output 2.1.0 shipped', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', attachmentId: 'a-1' }),
			httpResponses: [Uint8Array.from([7, 8]).buffer],
			typeVersion: 1,
		});
		const out = (await handleEnvelopeAttachment(ctx, 'get', 0)) as { binary: { data: { data: string } } };
		expect(getRecordedRequests(ctx)[0].options.encoding).toBe('arraybuffer');
		expect(Buffer.from(out.binary.data.data, 'base64')).toEqual(Buffer.from([7, 8]));
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

// Round 5: findings from the Codex review of 3.0.0.

describe('round 5: template notification settings', () => {
	const run = async (settings: IDataObject) => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', templateId: 'tp-1', notificationSettings: settings }), httpResponses: [{}] });
		await handleTemplate(ctx, 'updateNotificationSettings', 0);
		return getRecordedRequests(ctx)[0].options.body as IDataObject;
	};

	it('sends an expiration period set on its own, enabled so DocuSign applies it', async () => {
		// expireAfter only takes effect when expireEnabled is true (v2.1 spec, expirations.expireAfter).
		expect(await run({ expireAfter: 10 })).toEqual({ expirations: { expireAfter: '10', expireEnabled: 'true' } });
	});

	it('keeps 0 as 0 instead of replacing it with a default', async () => {
		expect(await run({ expireEnabled: 'true', expireWarn: 0 })).toEqual({ expirations: { expireEnabled: 'true', expireWarn: '0' } });
		// A reminders-only request also carries expireEnabled false, the account default, never expiry 0.
		expect(await run({ reminderEnabled: 'true', reminderDelay: 0 })).toEqual({
			reminders: { reminderEnabled: 'true', reminderDelay: '0' },
			expirations: { expireEnabled: 'false' },
		});
	});
});

describe('round 5: template create SMS signer', () => {
	it('sends SMS with a structured phone number', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({
				accountId: 'acct-1',
				templateName: 'T',
				emailSubject: 'S',
				name: 'T',
				description: '',
				additionalFields: {},
				documents: { document: [] },
				recipients: { signer: [{ roleName: 'R', deliveryMethod: 'sms', phoneNumber: '+44 7700900123' }] },
			}),
			httpResponses: [{ templateId: 't-1' }],
		});
		await handleTemplate(ctx, 'create', 0);
		const body = getRecordedRequests(ctx)[0].options.body as { recipients: { signers: IDataObject[] } };
		expect(body.recipients.signers[0]).toMatchObject({ deliveryMethod: 'SMS', phoneNumber: { countryCode: '44', number: '7700900123' } });
	});

	it('offers a phone number field on the template signer', () => {
		const field = new DocuSign().description.properties.find((p) => p.name === 'recipients' && (p.displayOptions?.show?.resource as string[]).includes('template'));
		expect(JSON.stringify(field)).toContain('"phoneNumber"');
	});
});

describe('round 5: list, radio and formula tabs keep their configuration', () => {
	it.each([
		['envelope', handleEnvelopeRecipientTab, { envelopeId: 'e-1' }],
		['template', handleTemplateRecipientTab, { templateId: 'tp-1' }],
	])('%s tabs pass listItems, radios, groupName and formula', async (_k, handler, ids) => {
		const listItems = [{ text: 'A', value: 'a' }];
		const radios = [{ value: 'yes', pageNumber: '1', xPosition: '10', yPosition: '20' }];
		const tab = { documentId: '1', pageNumber: '1', listItems: JSON.stringify(listItems), radios, groupName: 'g1', formula: '[Price]*2' };
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', ...ids, recipientId: '1', tabType: 'listTabs', tabs: { tab: [tab] } }),
			httpResponses: [{}],
		});
		await (handler as (c: IExecuteFunctions, o: string, i: number) => Promise<unknown>)(ctx, 'create', 0);
		const sent = (getRecordedRequests(ctx)[0].options.body as { listTabs: IDataObject[] }).listTabs[0];
		expect(sent).toMatchObject({ listItems, radios, groupName: 'g1', formula: '[Price]*2' });
	});

	it('rejects list items that are not a JSON array', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientId: '1', tabType: 'listTabs', tabs: { tab: [{ listItems: '{oops' }] } }),
			httpResponses: [{}],
		});
		await expect(handleEnvelopeRecipientTab(ctx, 'create', 0)).rejects.toThrow('List Items must be a JSON array');
	});
});

describe('round 5: Return All never silently truncates', () => {
	it('reads every group past the old 50-page limit', async () => {
		const pages = Array.from({ length: 52 }, (_, p) => ({
			groups: Array.from({ length: 100 }, (_, k) => ({ groupId: String(p * 100 + k) })),
			resultSetSize: '100',
			totalSetSize: '5200',
			...(p < 51 ? { nextUri: '/next' } : {}),
		}));
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', returnAll: true, groupFilters: {} }), httpResponses: pages });
		expect(await handleGroup(ctx, 'list', 0)).toHaveLength(5200);
	});
});

describe('round 5: a changed webhook URL removes the old subscription', () => {
	const methods = new DocuSignTrigger().webhookMethods.default;
	it('deletes the stale Connect configuration and forgets its ID', async () => {
		const staticData: IDataObject = { connectId: 'c-1' };
		const ctx = Object.assign(
			createMockContext({ credentials: C, httpResponses: [{ configurations: [{ connectId: 'c-1', urlToPublishTo: 'https://old.example.com/webhook/x' }] }, {}] }),
			{
				getWorkflowStaticData: () => staticData,
				getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc',
				getNodeParameter: (name: string) => (name === 'options' ? { hmacSecret: 'k' } : 'acct-1'),
				logger: { warn: jest.fn() },
			},
		) as unknown as IHookFunctions;
		await expect(methods.checkExists.call(ctx)).resolves.toBe(false);
		const reqs = getRecordedRequests(ctx as unknown as IExecuteFunctions);
		expect(reqs.map((r) => `${r.options.method} ${r.options.url}`)).toEqual([
			`GET ${DEMO}/accounts/acct-1/connect/c-1`,
			`DELETE ${DEMO}/accounts/acct-1/connect/c-1`,
		]);
		expect(staticData.connectId).toBeUndefined();
	});
});

describe('round 5: the spec-route check never counts as an assertion', () => {
	it('the setup hook throws rather than calling expect', () => {
		const src = readFileSync(`${__dirname}/setup/spec-routes.ts`, 'utf8');
		expect(src).not.toMatch(/\bexpect\(/);
		expect(src).toContain('throw new Error');
	});
});

// Round 6: findings from the Codex review of 3.1.0.

describe('round 6: version 1 Attachment Get keeps both earlier outputs', () => {
	const run = async (bytes: Buffer, typeVersion: number) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', attachmentId: 'a-1' }),
			httpResponses: [bytes],
			typeVersion,
		});
		return (await handleEnvelopeAttachment(ctx, 'get', 0)) as { json: IDataObject; binary: { data: { data: string } } };
	};

	it('version 1 returns the binary of 2.1.0 and the JSON fields of 3.0.0', async () => {
		const out = await run(Buffer.from('{"name":"x","attachmentType":"pdf"}'), 1);
		expect(out.json).toEqual({ attachmentId: 'a-1', fileName: 'attachment_a-1', name: 'x', attachmentType: 'pdf' });
		expect(Buffer.from(out.binary.data.data, 'base64').toString()).toBe('{"name":"x","attachmentType":"pdf"}');
	});

	it('version 1 passes a non-JSON body as text under data, as 3.0.0 did', async () => {
		const out = await run(Buffer.from('plain'), 1);
		expect(out.json).toMatchObject({ data: 'plain', attachmentId: 'a-1' });
	});

	it('version 2 stays binary with the file name only', async () => {
		const out = await run(Buffer.from('{"name":"x"}'), 2);
		expect(out.json).toEqual({ attachmentId: 'a-1', fileName: 'attachment_a-1' });
	});
});

describe('round 6: page rotation uses DocuSign left and right', () => {
	it.each([
		['clockwise90', ['right']],
		['counterclockwise90', ['left']],
		['clockwise180', ['right', 'right']],
	])('%s sends %j', async (rotation, turns) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', templateId: 'tp-1', documentId: '1', pageNumber: '2', rotation }),
			httpResponses: [{}, {}],
		});
		await handleTemplate(ctx, 'rotateDocumentPage', 0);
		expect(getRecordedRequests(ctx).map((r) => (r.options.body as IDataObject).rotate)).toEqual(turns);
	});
});

describe('round 6: workspace folder items', () => {
	const base = { accountId: 'acct-1', workspaceId: 'w-1', folderId: 'f-1' };
	it.each([
		[{ type: 'file' }, { include_files: 'true' }],
		[{ type: 'folder' }, { include_sub_folders: 'true' }],
		[{ includeFiles: true, includeSubFolders: false }, { include_files: 'true', include_sub_folders: 'false' }],
	])('list filters %j send %j and never type', async (filters, qs) => {
		const ctx = createMockContext({ credentials: C, parameters: params({ ...base, filters }), httpResponses: [{}] });
		await handleWorkspaceItem(ctx, 'listFolderItems', 0);
		expect(getRecordedRequests(ctx)[0].options.qs).toEqual(qs);
	});

	it('delete converts itemId and itemType to id and type', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ ...base, itemsJson: '[{"itemId":"i-1","itemType":"file"},{"id":"i-2","type":"folder"}]' }), httpResponses: [{}] });
		await handleWorkspaceItem(ctx, 'deleteFolderItems', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({ items: [{ id: 'i-1', type: 'file' }, { id: 'i-2', type: 'folder' }] });
	});
});

describe('round 6: chunked upload update starts at part 1', () => {
	it('Chunk Index defaults to 1, after the part Create uploads', () => {
		const field = new DocuSign().description.properties.find((p) => p.name === 'chunkIndex');
		expect(field?.default).toBe(1);
	});
});

describe('round 6: phone numbers without a separator', () => {
	it.each([
		['+14155550100', { countryCode: '1', number: '4155550100' }],
		['+447700900123', { countryCode: '44', number: '7700900123' }],
		['+353871234567', { countryCode: '353', number: '871234567' }],
		['+49 1701234567', { countryCode: '49', number: '1701234567' }],
	])('%s', (input, expected) => {
		expect(toRecipientPhone(input)).toEqual(expected);
	});
});

describe('round 6: Retry-After on a wrapped n8n error', () => {
	it('waits the server time read from error.cause.response.headers', async () => {
		const spy = jest.spyOn(global, 'setTimeout');
		const wrapped = Object.assign(new Error('slow down'), { httpCode: '429', cause: { response: { headers: { 'retry-after': '2' } } } });
		const ctx = createMockContext({ credentials: C, httpResponses: [wrapped, { ok: true }] });
		await expect(docuSignRequest(ctx, 'GET', 'accounts/a')).resolves.toEqual({ ok: true });
		expect(spy.mock.calls.some((call) => call[1] === 2000)).toBe(true);
		spy.mockRestore();
	});
});

describe('round 6: query parameters match the spec', () => {
	it('the spec check names a query parameter the route does not define', () => {
		expect(unknownQueryParams('GET', `${DEMO}/accounts/a/templates`, { folder: 'x', count: '1' })).toEqual(['folder']);
	});

	it('template Get Many sends Folder as folder_ids', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', returnAll: false, limit: 10, filters: { folder: 'f-1', folderIds: 'f-2' } }), httpResponses: [{}] });
		await handleTemplate(ctx, 'getAll', 0);
		const qs = getRecordedRequests(ctx)[0].options.qs as IDataObject;
		expect(qs.folder_ids).toBe('f-1,f-2');
		expect(qs).not.toHaveProperty('folder');
	});

	it('Connect event log filters Status after DocuSign returns the logs', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', filters: { status: 'completed' } }),
			// connectLog.status is the envelope status (Sent, Completed, ...), never Failed.
			httpResponses: [{ logs: [{ logId: '1', status: 'Completed' }, { logId: '2', status: 'Sent' }] }],
		});
		const out = (await handleConnectConfiguration(ctx, 'getEventLog', 0)) as { logs: IDataObject[] };
		expect(out.logs.map((l) => l.logId)).toEqual(['1']);
		expect(getRecordedRequests(ctx)[0].options.qs ?? {}).not.toHaveProperty('status');
	});
});

describe('round 6: the package carries the trademark notice', () => {
	it('files includes docs/TRADEMARKS.md', () => {
		const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { files: string[] };
		expect(pkg.files).toContain('docs/TRADEMARKS.md');
	});
});

// Round 7: findings from the Codex review of 3.2.0.

describe('round 7: a reminders-only request never expires the envelope next day', () => {
	const createParams = (additionalFields: IDataObject) => ({
		accountId: 'acct-1',
		emailSubject: 'Sign',
		status: 'created',
		templateName: 'T',
		name: 'T',
		description: '',
		additionalFields,
		signers: {},
		recipients: {},
		documents: { document: [] },
	});

	it.each([
		['envelope', handleEnvelope],
		['template', handleTemplate],
	])('%s create with only Reminder Delay sends expireEnabled false', async (_k, handler) => {
		const ctx = createMockContext({ credentials: C, parameters: params(createParams({ reminderDelay: 3 })), httpResponses: [{}] });
		await (handler as (c: IExecuteFunctions, o: string, i: number) => Promise<unknown>)(ctx, 'create', 0);
		const notification = (getRecordedRequests(ctx)[0].options.body as { notification: IDataObject }).notification;
		expect(notification.expirations).toEqual({ expireEnabled: 'false' });
		expect(notification.reminders).toMatchObject({ reminderEnabled: 'true', reminderDelay: '3' });
	});
});

describe('round 7: a signed event must belong to this subscription', () => {
	const trigger = new DocuSignTrigger();
	const run = async (body: IDataObject, connectId: string | undefined) => {
		const raw = Buffer.from(JSON.stringify(body));
		const status = jest.fn();
		const ctx = {
			getBodyData: () => body,
			getHeaderData: () => ({ 'x-docusign-signature-1': createHmac('sha256', 'k').update(raw).digest('base64') }),
			getNodeParameter: (name: string, fallback?: unknown) => (name === 'events' ? ['envelope-completed'] : name === 'options' ? { hmacSecret: 'k' } : fallback),
			getCredentials: async () => {
				throw new Error('not set');
			},
			getRequestObject: () => ({ rawBody: raw }),
			getResponseObject: () => ({ status: (c: number) => (status(c), { json: jest.fn() }) }),
			getWorkflowStaticData: () => (connectId ? { connectId } : {}),
			getNode: () => ({ credentials: {} }),
			helpers: { returnJsonArray: (d: IDataObject) => [{ json: d }] },
		} as unknown as IWebhookFunctions;
		return { result: await trigger.webhook.call(ctx), status };
	};

	it('ignores an event this trigger did not subscribe to', async () => {
		const { result, status } = await run({ event: 'envelope-sent', configurationId: 7 }, '7');
		expect(result.workflowData).toBeUndefined();
		expect(status).toHaveBeenCalledWith(200);
	});

	it('ignores an event from another Connect configuration', async () => {
		const { result } = await run({ event: 'envelope-completed', configurationId: 8 }, '7');
		expect(result.workflowData).toBeUndefined();
	});

	it('runs on a subscribed event from its own configuration', async () => {
		const { result } = await run({ event: 'envelope-completed', configurationId: 7 }, '7');
		expect(result.workflowData).toBeDefined();
	});
});

describe('round 7: an empty list outputs no items from node version 3', () => {
	const runList = async (typeVersion: number) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ resource: 'group', operation: 'list', accountId: 'acct-1', returnAll: true, groupFilters: {} }),
			httpResponses: [{ groups: [], resultSetSize: '0', totalSetSize: '0' }],
			typeVersion,
		});
		return new DocuSign().execute.call(ctx);
	};

	it('version 3 returns no items, so downstream nodes do not run', async () => {
		expect((await runList(3))[0]).toEqual([]);
	});

	it('versions 1 and 2 keep the count item saved workflows rely on', async () => {
		expect((await runList(2))[0]).toEqual([{ json: { success: true, count: 0 }, pairedItem: { item: 0 } }]);
	});
});

describe('round 7: email language is sent on its own', () => {
	it('envelope create signer sends supportedLanguage without a subject or body', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', emailSubject: 'Sign', status: 'created', additionalFields: {}, documents: { document: [] }, signers: { signer: [{ email: 'a@example.com', name: 'A', supportedLanguage: 'de' }] } }),
			httpResponses: [{}],
		});
		await handleEnvelope(ctx, 'create', 0);
		const body = getRecordedRequests(ctx)[0].options.body as { recipients: { signers: IDataObject[] } };
		expect(body.recipients.signers[0].emailNotification).toEqual({ supportedLanguage: 'de' });
	});

	it('recipient add sends supportedLanguage without a subject or body', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientType: 'signers', recipientEmail: 'a@example.com', recipientName: 'A', recipientId: '1', additionalFields: { supportedLanguage: 'de' } }),
			httpResponses: [{}],
		});
		await handleRecipient(ctx, 'add', 0);
		expect((getRecordedRequests(ctx)[0].options.body as { signers: IDataObject[] }).signers[0].emailNotification).toEqual({ supportedLanguage: 'de' });
	});
});

describe('round 7: the Connect log Status filter names envelope statuses', () => {
	it('does not suggest Failed, which is not a connectLog status', () => {
		const field = new DocuSign().description.properties.find((p) => p.name === 'filters' && (p.displayOptions?.show?.resource as string[]).includes('connectConfiguration'));
		const status = (field as { options: Array<{ name: string; description: string }> }).options.find((o) => o.name === 'status');
		expect(status?.description).not.toContain('Failed');
		expect(status?.description).toContain('Get Event Failures');
	});
});

// Round 8: findings from the Codex review of 3.3.0.

describe('round 8: the trigger fails closed on events without subscription details', () => {
	const trigger = new DocuSignTrigger();
	const run = async (body: IDataObject, connectId?: string) => {
		const raw = Buffer.from(JSON.stringify(body));
		const status = jest.fn();
		const ctx = {
			getBodyData: () => body,
			getHeaderData: () => ({ 'x-docusign-signature-1': createHmac('sha256', 'k').update(raw).digest('base64') }),
			getNodeParameter: (name: string, fallback?: unknown) => (name === 'events' ? ['envelope-completed'] : name === 'options' ? { hmacSecret: 'k' } : fallback),
			getCredentials: async () => {
				throw new Error('not set');
			},
			getRequestObject: () => ({ rawBody: raw }),
			getResponseObject: () => ({ status: (c: number) => (status(c), { json: jest.fn() }) }),
			getWorkflowStaticData: () => (connectId ? { connectId } : {}),
			getNode: () => ({ credentials: {} }),
			helpers: { returnJsonArray: (d: IDataObject) => [{ json: d }] },
		} as unknown as IWebhookFunctions;
		return trigger.webhook.call(ctx);
	};

	it.each([
		['no event name (legacy XML)', { envelopeStatus: 'Sent' }, '7'],
		['no configurationId', { event: 'envelope-completed' }, '7'],
		['no stored subscription', { event: 'envelope-completed', configurationId: 7 }, undefined],
	])('ignores a signed payload with %s', async (_k, body, connectId) => {
		expect((await run(body, connectId)).workflowData).toBeUndefined();
	});
});

describe('round 8: an empty list response outputs no items on version 3', () => {
	const run = async (typeVersion: number, resource: string, operation: string, extra: IDataObject, response: IDataObject) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ resource, operation, accountId: 'acct-1', ...extra }),
			httpResponses: [response],
			typeVersion,
		});
		return (await new DocuSign().execute.call(ctx))[0];
	};

	it('Group Get Many without Return All returns no items for an empty groups list (version 4)', async () => {
		expect(await run(4, 'group', 'list', { returnAll: false, groupFilters: {} }, { groups: [], resultSetSize: '0' })).toEqual([]);
	});

	it('version 2 keeps the response item saved workflows rely on', async () => {
		expect(await run(2, 'group', 'list', { returnAll: false, groupFilters: {} }, { groups: [] })).toHaveLength(1);
	});

	it('a non-list operation with an empty array field still outputs its item', () => {
		expect(isEmptyListResponse('get', { envelopeId: 'e-1', customFields: [] })).toBe(false);
		expect(isEmptyListResponse('listDocuments', { envelopeId: 'e-1', envelopeDocuments: [] })).toBe(true);
		expect(isEmptyListResponse('list', { users: [{ userId: 'u' }] })).toBe(false);
	});
});

describe('round 8: anchor options go out exactly as chosen', () => {
	const run = async (tab: IDataObject) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientId: '1', tabType: 'textTabs', tabs: { tab: [tab] } }),
			httpResponses: [{}],
			typeVersion: 4,
		});
		await handleEnvelopeRecipientTab(ctx, 'create', 0);
		return (getRecordedRequests(ctx)[0].options.body as { textTabs: IDataObject[] }).textTabs[0];
	};

	it('sends No for whole-word matching instead of leaving it to the default', async () => {
		const sent = await run({ placementMethod: 'anchor', anchorString: '/sig/', anchorMatchWholeWord: 'false', anchorCaseSensitive: 'false' });
		expect(sent).toMatchObject({ anchorString: '/sig/', anchorMatchWholeWord: 'false', anchorCaseSensitive: 'false' });
	});

	it('rejects Center alignment, which DocuSign does not support', async () => {
		await expect(run({ placementMethod: 'anchor', anchorString: '/sig/', anchorHorizontalAlignment: 'center' })).rejects.toThrow('Left or Right');
	});

	it('the picker offers only Left and Right', () => {
		const tabs = new DocuSign().description.properties.filter((p) => p.name === 'tabs');
		expect(JSON.stringify(tabs)).not.toContain('"center"');
	});
});

// Round 9: findings from the confirming Codex review of the published 3.4.0.

describe('round 9: version 3 keeps the 3.3.0 output for list responses', () => {
	it('a saved version 3 Group Get Many still outputs the empty response item', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ resource: 'group', operation: 'list', accountId: 'acct-1', returnAll: false, groupFilters: {} }),
			httpResponses: [{ groups: [] }],
			typeVersion: 3,
		});
		expect((await new DocuSign().execute.call(ctx))[0]).toEqual([{ json: { groups: [] }, pairedItem: { item: 0 } }]);
	});
});

describe('round 9: user and profile fields use DocuSign names', () => {
	it('user create assigns the group through groupList', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', email: 'a@example.com', userName: 'A', createFields: { groupId: 'g-1' } }),
			httpResponses: [{}],
		});
		await handleUser(ctx, 'create', 0);
		const user = (getRecordedRequests(ctx)[0].options.body as { newUsers: IDataObject[] }).newUsers[0];
		expect(user.groupList).toEqual([{ groupId: 'g-1' }]);
		expect(user).not.toHaveProperty('groupId');
	});

	it('profile update sends Company as companyName', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', userId: 'u-1', additionalFields: { company: 'Example' } }), httpResponses: [{}] });
		await handleUserProfile(ctx, 'update', 0);
		const body = getRecordedRequests(ctx)[0].options.body as IDataObject;
		expect(body.companyName).toBe('Example');
		expect(body).not.toHaveProperty('company');
	});
});

describe('round 9: Reminder Frequency on its own turns reminders on', () => {
	it.each([
		['envelope', handleEnvelope],
		['template', handleTemplate],
	])('%s create sends reminders for a frequency set without a delay', async (_k, handler) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', emailSubject: 'Sign', status: 'created', templateName: 'T', name: 'T', description: '', additionalFields: { reminderFrequency: 7 }, signers: {}, recipients: {}, documents: { document: [] } }),
			httpResponses: [{}],
		});
		await (handler as (c: IExecuteFunctions, o: string, i: number) => Promise<unknown>)(ctx, 'create', 0);
		const notification = (getRecordedRequests(ctx)[0].options.body as { notification: IDataObject }).notification;
		expect(notification.reminders).toEqual({ reminderEnabled: 'true', reminderDelay: '3', reminderFrequency: '7' });
	});
});

describe('round 9: an existing subscription still needs the HMAC key', () => {
	it('checkExists refuses to report a subscription when no key is configured', async () => {
		const methods = new DocuSignTrigger().webhookMethods.default;
		const ctx = Object.assign(createMockContext({ credentials: C, httpResponses: [{ configurations: [{ urlToPublishTo: 'https://n8n.example.com/webhook/abc' }] }] }), {
			getWorkflowStaticData: () => ({ connectId: 'c-1' }),
			getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc',
			getNodeParameter: (name: string) => (name === 'options' ? {} : 'acct-1'),
			logger: { warn: jest.fn() },
		}) as unknown as IHookFunctions;
		await expect(methods.checkExists.call(ctx)).rejects.toThrow('HMAC');
		expect(getRecordedRequests(ctx as unknown as IExecuteFunctions)).toHaveLength(0);
	});
});

// Round 9, branch review: findings on the working tree before release.

describe('round 9b: Connect registration sends the fields the spec requires', () => {
	it('create sends configurationType, deliveryMode SIM and enableLog', async () => {
		const methods = new DocuSignTrigger().webhookMethods.default;
		const staticData: IDataObject = {};
		const ctx = Object.assign(createMockContext({ credentials: C, httpResponses: [{ connectId: 'c-9' }] }), {
			getWorkflowStaticData: () => staticData,
			getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc',
			getNodeParameter: (name: string, fallback?: unknown) =>
				(({ accountId: 'acct-1', events: ['envelope-completed'], options: { hmacSecret: 'k' } }) as IDataObject)[name] ?? fallback,
			logger: { warn: jest.fn() },
		}) as unknown as IHookFunctions;
		await methods.create.call(ctx);
		expect(getRecordedRequests(ctx as unknown as IExecuteFunctions)[0].options.body).toMatchObject({
			configurationType: 'custom',
			deliveryMode: 'SIM',
			enableLog: 'true',
		});
	});
});

describe('round 9b: choosing an ID check turns on requireIdLookup', () => {
	it('template create signer', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', templateName: 'T', emailSubject: 'S', name: 'T', description: '', additionalFields: {}, documents: { document: [] }, recipients: { signer: [{ roleName: 'R', idCheckConfigurationName: 'ID Check $' }] } }),
			httpResponses: [{}],
			typeVersion: 4,
		});
		await handleTemplate(ctx, 'create', 0);
		expect((getRecordedRequests(ctx)[0].options.body as { recipients: { signers: IDataObject[] } }).recipients.signers[0]).toMatchObject({ idCheckConfigurationName: 'ID Check $', requireIdLookup: 'true' });
	});

	it('template recipient create keeps an explicit value and fills a missing one', async () => {
		const run = async (extra: IDataObject) => {
			const ctx = createMockContext({
				credentials: C,
				parameters: params({ accountId: 'acct-1', templateId: 'tp-1', recipientType: 'signers', roleName: 'R', routingOrder: '1', additionalFields: { idCheckConfigurationName: 'ID Check $', ...extra } }),
				httpResponses: [{}],
				typeVersion: 4,
			});
			await handleTemplateRecipient(ctx, 'create', 0);
			return (getRecordedRequests(ctx)[0].options.body as { signers: IDataObject[] }).signers[0].requireIdLookup;
		};
		expect(await run({})).toBe('true');
		expect(await run({ requireIdLookup: 'false' })).toBe('false');
	});

	it('envelope recipient add fills a missing value and keeps a chosen No', async () => {
		const run = async (extra: IDataObject) => {
			const ctx = createMockContext({
				credentials: C,
				parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientType: 'signers', recipientEmail: 'a@example.com', recipientName: 'A', recipientId: '1', additionalFields: { idCheckConfigurationName: 'ID Check $', ...extra } }),
				httpResponses: [{}],
				typeVersion: 4,
			});
			await handleRecipient(ctx, 'add', 0);
			return (getRecordedRequests(ctx)[0].options.body as { signers: IDataObject[] }).signers[0].requireIdLookup;
		};
		expect(await run({})).toBe('true');
		expect(await run({ requireIdLookup: 'false' })).toBe('false');
	});
});

describe('round 9b: the declared n8n range matches the API the nodes use', () => {
	it('states n8n 1.86.0, the first release whose n8n-workflow (1.84.0) exports NodeConnectionTypes', () => {
		// n8n verification requires peerDependencies n8n-workflow "*", so the minimum is documented.
		expect(readFileSync('README.md', 'utf8')).toContain('n8n 1.86.0 or later');
		expect(readFileSync('README.md', 'utf8')).not.toContain('- n8n 1.x and 2.x, self-hosted.');
		expect(new DocuSign().description.outputs).toEqual(['main']);
	});
});

describe('round 9b: branding uploads follow the documented contract', () => {
	const base = { accountId: 'acct-1', brandId: 'b-1', uploadSource: 'base64', base64Content: Buffer.from('<xml/>').toString('base64') };

	it('logo upload names the file in Content-Disposition', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ ...base, logoType: 'primary' }), httpResponses: [{}] });
		await handleAccountBrand(ctx, 'updateLogo', 0);
		const headers = getRecordedRequests(ctx)[0].options.headers as Record<string, string>;
		expect(headers['Content-Disposition']).toBe('form-data; name="file"; filename="logo_primary.png"');
	});

	it('resource upload is multipart/form-data with a file.xml part', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ ...base, resourceContentType: 'sending' }), httpResponses: [{}] });
		await handleAccountBrand(ctx, 'updateResource', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(String((req.headers as Record<string, string>)['Content-Type'])).toMatch(/^multipart\/form-data; boundary=/);
		const body = Buffer.from(req.body as unknown as Buffer).toString();
		expect(body).toContain('Content-Disposition: form-data; name="file.xml"; filename="sending.xml"');
		expect(body).toContain('<xml/>');
	});
});

// Round 9c: second branch review, plus bugs the new body-key check found.

describe('round 9c: request bodies use the spec field names', () => {
	it('PowerForm Delete Many sends powerForms objects', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', powerFormIds: 'pf-1, pf-2' }), httpResponses: [{}] });
		await handlePowerForm(ctx, 'deleteList', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({ powerForms: [{ powerFormId: 'pf-1' }, { powerFormId: 'pf-2' }] });
	});

	it('account custom field sends customFieldType', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', fieldType: 'text', name: 'Region', additionalFields: {} }), httpResponses: [{}] });
		await handleAccountCustomField(ctx, 'create', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({ customFieldType: 'text', name: 'Region' });
	});

	it('eNote configuration sends eNoteConfigured', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', eNoteEnabled: 'true' }), httpResponses: [{}] });
		await handleENoteConfiguration(ctx, 'update', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({ eNoteConfigured: 'true' });
	});

	it('template document update wraps the document in an envelopeDefinition', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', templateId: 'tp-1', documentId: '1', documentData: { content: [{ documentBase64: 'JVBERg==', name: 'c.pdf' }] } }), httpResponses: [{}] });
		await handleTemplateDocument(ctx, 'update', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({ documents: [{ documentBase64: 'JVBERg==', name: 'c.pdf', fileExtension: 'pdf', documentId: '1' }] });
	});

	it('historical republish converts an envelopeIds list to envelopes', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', requestBody: '{"envelopeIds":["e-1","e-2"]}' }), httpResponses: [{}] });
		await handleConnectConfiguration(ctx, 'publishToConnect', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({ envelopes: [{ envelopeId: 'e-1' }, { envelopeId: 'e-2' }] });
	});

	it('the spec check names a body key the schema does not define', () => {
		expect(unknownBodyKeys('DELETE', `${DEMO}/accounts/a/powerforms`, { powerFormIds: ['x'] })).toEqual(['powerFormIds']);
		expect(unknownBodyKeys('DELETE', `${DEMO}/accounts/a/powerforms`, { powerForms: [] })).toEqual([]);
	});
});

describe('round 9c: attachment replace and tab alignment', () => {
	it('Create with an Attachment ID to Replace updates that attachment', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', attachmentName: 'a.pdf', attachmentType: 'pdf', source: 'base64', base64Content: 'JVBERg==', replaceAttachmentId: 'a-7' }),
			httpResponses: [{}],
		});
		await handleEnvelopeAttachment(ctx, 'create', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.url).toBe(`${DEMO}/accounts/acct-1/envelopes/e-1/attachments/a-7`);
		expect(req.body).toMatchObject({ attachmentId: 'a-7', name: 'a.pdf', data: 'JVBERg==' });
	});

	it.each([
		[{ placementMethod: 'anchor', anchorString: '/x/', anchorHorizontalAlignment: 'left' }, false],
		[{ tabId: 't-1', anchorHorizontalAlignment: 'left' }, true],
	])('Left alignment is sent for %j', async (tab, sendEmptyValues) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientId: '1', tabType: 'textTabs', tabs: { tab: [tab] }, sendEmptyValues }),
			httpResponses: [{}],
			typeVersion: 4,
		});
		await handleEnvelopeRecipientTab(ctx, sendEmptyValues ? 'update' : 'create', 0);
		expect((getRecordedRequests(ctx)[0].options.body as { textTabs: IDataObject[] }).textTabs[0].anchorHorizontalAlignment).toBe('left');
	});
});

// Round 9d: third branch review.

describe('round 9d: JSON parameters accept an expression that is already an object', () => {
	it('parseJsonInput passes objects and arrays through and parses text', () => {
		expect(parseJsonInput({ a: 1 })).toEqual({ a: 1 });
		expect(parseJsonInput([1])).toEqual([1]);
		expect(parseJsonInput('{"a":1}')).toEqual({ a: 1 });
		expect(() => parseJsonInput('{bad')).toThrow();
	});

	it('bulk send list create sends an object expression as the body', async () => {
		const list = { name: 'L', bulkCopies: [] };
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', requestBody: list }), httpResponses: [{}] });
		await handleBulkEnvelope(ctx, 'createBulkSendList', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual(list);
	});

	it('envelope workflow update sends an object expression as the body', async () => {
		const workflow = { workflowStatus: 'paused' };
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', scope: 'envelope', envelopeId: 'e-1', requestBody: workflow }), httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'updateEnvelopeWorkflow', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual(workflow);
	});

	it('no handler parses a parameter with a bare JSON.parse', () => {
		const dir = 'nodes/DocuSign/resources';
		const offenders = readdirSync(dir)
			.flatMap((r) => readdirSync(`${dir}/${r}`).filter((f) => f.endsWith('.handler.ts')).map((f) => `${dir}/${r}/${f}`))
			.filter((f) => !f.endsWith('envelopeAttachment.handler.ts') && readFileSync(f, 'utf8').includes('JSON.parse('));
		expect(offenders).toEqual([]);
	});
});

describe('round 9d: witnesses name the signer they witness', () => {
	it('envelope recipient add sends witnessFor', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientType: 'witnesses', recipientEmail: 'w@example.com', recipientName: 'W', recipientId: '2', additionalFields: { witnessFor: '1' } }),
			httpResponses: [{}],
		});
		await handleRecipient(ctx, 'add', 0);
		expect((getRecordedRequests(ctx)[0].options.body as { witnesses: IDataObject[] }).witnesses[0].witnessFor).toBe('1');
	});

	it('template recipient create sends witnessFor', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', templateId: 'tp-1', recipientType: 'witnesses', roleName: 'W', routingOrder: '1', additionalFields: { witnessFor: '1' } }),
			httpResponses: [{}],
		});
		await handleTemplateRecipient(ctx, 'create', 0);
		expect((getRecordedRequests(ctx)[0].options.body as { witnesses: IDataObject[] }).witnesses[0].witnessFor).toBe('1');
	});
});

describe('round 9d: whole-word matching defaults to DocuSign', () => {
	it('the default leaves anchorMatchWholeWord out, as releases before 3.4.0 did', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientId: '1', tabType: 'textTabs', tabs: { tab: [{ placementMethod: 'anchor', anchorString: '/s/', anchorMatchWholeWord: '' }] } }),
			httpResponses: [{}],
		});
		await handleEnvelopeRecipientTab(ctx, 'create', 0);
		expect((getRecordedRequests(ctx)[0].options.body as { textTabs: IDataObject[] }).textTabs[0]).not.toHaveProperty('anchorMatchWholeWord');
		for (const tabs of new DocuSign().description.properties.filter((p) => p.name === 'tabs')) {
			const values = (tabs.options as Array<{ values: Array<{ name: string; default: unknown }> }>)[0].values;
			expect(values.find((v) => v.name === 'anchorMatchWholeWord')?.default).toBe('');
		}
	});
});

describe('round 9d: the quick start names the template role', () => {
	it('step 4 mentions the Role Name', () => {
		expect(readFileSync('README.md', 'utf8')).toMatch(/4\. Pick your account, paste a template ID, add a template role with the Role Name/);
	});
});

// Round 9e: fourth branch review.

describe('round 9e: an existing subscription must match the requested settings', () => {
	const methods = new DocuSignTrigger().webhookMethods.default;
	const hook = (config: IDataObject, staticData: IDataObject) =>
		Object.assign(createMockContext({ credentials: C, httpResponses: [{ configurations: [config] }, {}] }), {
			getWorkflowStaticData: () => staticData,
			getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc',
			getNodeParameter: (name: string, fallback?: unknown) =>
				(({ accountId: 'acct-1', events: ['envelope-completed'], options: { hmacSecret: 'k' } }) as IDataObject)[name] ?? fallback,
			logger: { warn: jest.fn() },
		}) as unknown as IHookFunctions;

	it('re-registers a subscription listening to other events', async () => {
		const staticData: IDataObject = { connectId: 'c-1' };
		const ctx = hook({ urlToPublishTo: 'https://n8n.example.com/webhook/abc', events: ['envelope-sent'] }, staticData);
		await expect(methods.checkExists.call(ctx)).resolves.toBe(false);
		expect(getRecordedRequests(ctx as unknown as IExecuteFunctions).map((r) => r.options.method)).toEqual(['GET', 'DELETE']);
		expect(staticData.connectId).toBeUndefined();
	});

	it('keeps a subscription with the same events, JSON SIM delivery and HMAC', () => {
		expect(matchesSubscription({ events: ['envelope-completed'], eventData: { format: 'json' }, deliveryMode: 'SIM', includeHMAC: 'true' }, ['envelope-completed'])).toBe(true);
		expect(matchesSubscription({ events: ['envelope-completed'], eventData: { format: 'xml' } }, ['envelope-completed'])).toBe(false);
		expect(matchesSubscription({ events: ['envelope-completed'], includeHMAC: 'false' }, ['envelope-completed'])).toBe(false);
		expect(matchesSubscription({ events: ['envelope-completed'], deliveryMode: 'Aggregate' }, ['envelope-completed'])).toBe(false);
	});
});

describe('round 9e: Phone Auth sends phoneAuthentication', () => {
	it('envelope create signer with sender numbers', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', emailSubject: 'Sign', status: 'created', additionalFields: {}, documents: { document: [] }, signers: { signer: [{ email: 'a@example.com', name: 'A', idCheckConfigurationName: 'Phone Auth $', phoneAuthNumbers: '+14155550100, +14155550101' }] } }),
			httpResponses: [{}],
		});
		await handleEnvelope(ctx, 'create', 0);
		const signer = (getRecordedRequests(ctx)[0].options.body as { recipients: { signers: IDataObject[] } }).recipients.signers[0];
		expect(signer.phoneAuthentication).toEqual({ recipMayProvideNumber: 'false', senderProvidedNumbers: ['+14155550100', '+14155550101'] });
	});

	it('recipient add without numbers lets the recipient supply one', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientType: 'signers', recipientEmail: 'a@example.com', recipientName: 'A', recipientId: '1', additionalFields: { idCheckConfigurationName: 'Phone Auth $' } }),
			httpResponses: [{}],
		});
		await handleRecipient(ctx, 'add', 0);
		expect((getRecordedRequests(ctx)[0].options.body as { signers: IDataObject[] }).signers[0].phoneAuthentication).toEqual({ recipMayProvideNumber: 'true', senderProvidedNumbers: [] });
	});
});

describe('round 9e: font size', () => {
	const run = async (fontSize: string) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientId: '1', tabType: 'textTabs', tabs: { tab: [{ placementMethod: 'anchor', anchorString: '/s/', fontSize }] } }),
			httpResponses: [{}],
			typeVersion: 4,
		});
		await handleEnvelopeRecipientTab(ctx, 'create', 0);
		return (getRecordedRequests(ctx)[0].options.body as { textTabs: IDataObject[] }).textTabs[0];
	};

	it('sends a chosen Size 12', async () => {
		expect((await run('size12')).fontSize).toBe('size12');
	});

	it('Account Default, the default, leaves fontSize out as earlier versions did', async () => {
		expect(await run('')).not.toHaveProperty('fontSize');
		for (const tabs of new DocuSign().description.properties.filter((p) => p.name === 'tabs')) {
			const values = (tabs.options as Array<{ values: Array<{ name: string; default: unknown }> }>)[0].values;
			expect(values.find((v) => v.name === 'fontSize')?.default).toBe('');
		}
	});
});

describe('round 9e: README describes the version 4 list rule', () => {
	it('does not tell users the object-list rule is on version 3', () => {
		const readme = readFileSync('README.md', 'utf8');
		expect(readme).not.toContain('| Version 3 nodes output no items for list responses whose result arrays are empty');
		expect(readme).toContain('that rule moved to version 4');
	});
});

// Round 9f: fifth branch review.

describe('round 9f: an empty list never swallows real data', () => {
	it('a list response with data fields beside an empty array still outputs its item', () => {
		expect(isEmptyListResponse('listSettings', { accountSettings: { allowInPerson: 'true' }, additionalSettings: [] })).toBe(false);
		expect(isEmptyListResponse('list', { groups: [], resultSetSize: '0', totalSetSize: '0', nextUri: '' })).toBe(true);
	});
});

describe('round 9f: request fields use the spec names', () => {
	it('permission profile settings map to accountRoleSettings names', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', permissionProfileName: 'P', settings: { enableSequentialSigningAPI: 'false', enableVaulting: 'true', allowBulkSending: 'true' } }), httpResponses: [{}] });
		await handleAccountPermissionProfile(ctx, 'create', 0);
		expect((getRecordedRequests(ctx)[0].options.body as IDataObject).settings).toEqual({ allowApiSequentialSigning: 'false', allowVaulting: 'true', allowBulkSending: 'true' });
	});

	it('user profile address uses addressInformation names', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', userId: 'u-1', additionalFields: { street1: '1 Main', street2: 'Apt 2', state: 'CA', zip: '94105', city: 'SF' } }), httpResponses: [{}] });
		await handleUserProfile(ctx, 'update', 0);
		expect((getRecordedRequests(ctx)[0].options.body as IDataObject).address).toEqual({ address1: '1 Main', address2: 'Apt 2', stateOrProvince: 'CA', postalCode: '94105', city: 'SF' });
	});

	it('tab settings drop the two fields tabAccountSettings does not define', async () => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', tabSettings: { tabLockingEnabled: 'true', enableAutoStamp: 'true', confirmInitialEnvelopeSend: 'false' } }), httpResponses: [{}] });
		await handleAccountTabSetting(ctx, 'update', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({ tabLockingEnabled: 'true' });
		const field = JSON.stringify(new DocuSign().description.properties.find((p) => p.name === 'tabSettings'));
		expect(field).not.toContain('enableAutoStamp');
		expect(field).not.toContain('confirmInitialEnvelopeSend');
	});
});

describe('round 9f: folders', () => {
	const run = async (op: string, extra: IDataObject, typeVersion = 4) => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', folderId: 'f-1', searchFolderId: 'drafts', ...extra }), httpResponses: [{}], typeVersion });
		await handleFolder(ctx, op, 0);
		return (getRecordedRequests(ctx)[0].options.qs ?? {}) as IDataObject;
	};

	it('version 4 List Items asks for the items by default', async () => {
		expect(await run('listItems', { filters: {} })).toEqual({ include_items: 'true' });
	});

	it('earlier versions keep the request they sent', async () => {
		expect(await run('listItems', { filters: {} }, 3)).toEqual({});
	});

	it('list items and search send only parameters their routes define', async () => {
		expect(await run('listItems', { filters: { count: 5, search_text: 'x' } })).toEqual({ search_text: 'x', include_items: 'true' });
		expect(await run('search', { searchFilters: { search_text: 'x', count: 5 } })).toEqual({ count: 5 });
	});
});

describe('round 9f: subscription settings must match', () => {
	it('documents, certificate and acknowledgement settings are compared', () => {
		const base = { events: ['envelope-completed'] };
		expect(matchesSubscription({ ...base, includeDocuments: 'true' }, ['envelope-completed'], {})).toBe(false);
		expect(matchesSubscription({ ...base, includeDocuments: 'true' }, ['envelope-completed'], { includeDocuments: true })).toBe(true);
		expect(matchesSubscription({ ...base, requiresAcknowledgement: 'false' }, ['envelope-completed'], {})).toBe(false);
		expect(matchesSubscription({ ...base, includeCertificateOfCompletion: 'true' }, ['envelope-completed'], {})).toBe(false);
	});
});

describe('round 9g: saved tab values on versions 1 to 3 keep the 3.3.0 output', () => {
	const run = async (tab: IDataObject, typeVersion: number) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientId: '1', tabType: 'textTabs', tabs: { tab: [tab] } }),
			httpResponses: [{}],
			typeVersion,
		});
		await handleEnvelopeRecipientTab(ctx, 'create', 0);
		return (getRecordedRequests(ctx)[0].options.body as { textTabs: IDataObject[] }).textTabs[0];
	};
	const saved = { placementMethod: 'anchor', anchorString: '/s/', anchorMatchWholeWord: 'false', anchorCaseSensitive: 'false', fontSize: 'size12', alignment: 'left' };

	it.each([1, 2, 3])('version %i omits a saved No, Size 12 and Left', async (v) => {
		const tab = await run(saved, v);
		expect(tab).not.toHaveProperty('anchorMatchWholeWord');
		expect(tab).not.toHaveProperty('anchorCaseSensitive');
		expect(tab).not.toHaveProperty('fontSize');
		expect(tab).not.toHaveProperty('tabLabelAlignment');
		expect(tab).not.toHaveProperty('anchorHorizontalAlignment');
	});

	it.each([1, 2, 3])('version %i still sends a chosen Yes and Right', async (v) => {
		const tab = await run({ ...saved, anchorMatchWholeWord: 'true', alignment: 'right', fontSize: 'size14' }, v);
		expect(tab.anchorMatchWholeWord).toBe('true');
		expect(tab.fontSize).toBe('size14');
	});

	it('version 4 sends the chosen No and Size 12', async () => {
		const tab = await run(saved, 4);
		expect(tab.anchorMatchWholeWord).toBe('false');
		expect(tab.fontSize).toBe('size12');
	});
});

describe('round 9g: an attached HMAC credential never falls back to the old option', () => {
	const raw = Buffer.from('{"event":"envelope-sent","configurationId":"c-1"}');
	const sig = createHmac('sha256', 'old-key').update(raw).digest('base64');
	it('rejects a request signed with the old option key when the credential fails to load', async () => {
		const status = jest.fn();
		const ctx = {
			getBodyData: () => JSON.parse(raw.toString()),
			getHeaderData: () => ({ 'x-docusign-signature-1': sig }),
			getNodeParameter: (name: string) => (name === 'events' ? ['envelope-sent'] : { hmacSecret: 'old-key' }),
			getCredentials: async () => {
				throw new Error('decryption failed');
			},
			getRequestObject: () => ({ rawBody: raw }),
			getResponseObject: () => ({ status: (c: number) => (status(c), { json: jest.fn() }) }),
			getWorkflowStaticData: () => ({ connectId: 'c-1' }),
			getNode: () => ({ credentials: { docuSignConnectHmacApi: { id: '1', name: 'HMAC' } } }),
			helpers: { returnJsonArray: (d: IDataObject) => [{ json: d }] },
		} as unknown as IWebhookFunctions;
		const result = await new DocuSignTrigger().webhook.call(ctx);
		expect(result.workflowData).toBeUndefined();
		expect(status).toHaveBeenCalledWith(401);
	});
});

describe('round 9g: request bodies match the documented input', () => {
	it.each([
		['[{"authorizationId":"a-1"},{"authorizationId":"a-2"}]'],
		['["a-1","a-2"]'],
		['{"authorizations":[{"authorizationId":"a-1"},{"authorizationId":"a-2"}]}'],
	])('batch revocation sends { authorizations } for %s', async (input) => {
		const ctx = createMockContext({ credentials: C, parameters: params({ accountId: 'acct-1', userId: 'u-1', deleteAuthorizationsBody: input }), httpResponses: [{}] });
		await handleAuthorization(ctx, 'deleteUserAuthorizations', 0);
		expect(getRecordedRequests(ctx)[0].options.body).toEqual({ authorizations: [{ authorizationId: 'a-1' }, { authorizationId: 'a-2' }] });
	});

	it.each([['["user@example.com"]'], ['[{"email":"user@example.com"}]']])('contact emails are strings for %s', async (emails) => {
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', contactName: 'A', name: 'A', additionalFields: { emails } }),
			httpResponses: [{}],
		});
		await handleUserContact(ctx, 'create', 0);
		const body = getRecordedRequests(ctx)[0].options.body as { contactList: IDataObject[] };
		expect(body.contactList[0].emails).toEqual(['user@example.com']);
	});
});

describe('round 9g: access codes are masked in the editor', () => {
	const collect = (props: unknown[], out: IDataObject[] = []): IDataObject[] => {
		for (const p of props as IDataObject[]) {
			if (p.name === 'accessCode' || p.name === 'activationAccessCode') out.push(p);
			const opts = p.options as unknown[] | undefined;
			if (Array.isArray(opts)) {
				for (const o of opts as IDataObject[]) {
					if (Array.isArray(o.values)) collect(o.values as unknown[], out);
					else if (o.type) collect([o], out);
				}
			}
		}
		return out;
	};
	it('every access code field is a password field', () => {
		const found = collect(new DocuSign().description.properties);
		expect(found.length).toBeGreaterThan(3);
		for (const p of found) expect((p.typeOptions as IDataObject)?.password).toBe(true);
	});
});

describe('round 9h: ID check on versions 1 to 3 sends what 3.4.0 sent', () => {
	it.each([1, 2, 3])('version %i: recipient add keeps a chosen No and adds nothing when unset', async (v) => {
		const run = async (extra: IDataObject) => {
			const ctx = createMockContext({
				credentials: C,
				parameters: params({ accountId: 'acct-1', envelopeId: 'e-1', recipientType: 'signers', recipientEmail: 'a@example.com', recipientName: 'A', recipientId: '1', additionalFields: { idCheckConfigurationName: 'ID Check $', ...extra } }),
				httpResponses: [{}],
				typeVersion: v,
			});
			await handleRecipient(ctx, 'add', 0);
			return (getRecordedRequests(ctx)[0].options.body as { signers: IDataObject[] }).signers[0];
		};
		expect((await run({ requireIdLookup: 'false' })).requireIdLookup).toBe('false');
		expect(await run({})).not.toHaveProperty('requireIdLookup');
	});

	it.each([1, 2, 3])('version %i: template signer and template recipient do not add requireIdLookup', async (v) => {
		const t = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', templateName: 'T', emailSubject: 'S', name: 'T', description: '', additionalFields: {}, documents: { document: [] }, recipients: { signer: [{ roleName: 'R', idCheckConfigurationName: 'ID Check $' }] } }),
			httpResponses: [{}],
			typeVersion: v,
		});
		await handleTemplate(t, 'create', 0);
		expect((getRecordedRequests(t)[0].options.body as { recipients: { signers: IDataObject[] } }).recipients.signers[0]).not.toHaveProperty('requireIdLookup');
		const r = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', templateId: 'tp-1', recipientType: 'signers', roleName: 'R', routingOrder: '1', additionalFields: { idCheckConfigurationName: 'ID Check $' } }),
			httpResponses: [{}],
			typeVersion: v,
		});
		await handleTemplateRecipient(r, 'create', 0);
		expect((getRecordedRequests(r)[0].options.body as { signers: IDataObject[] }).signers[0]).not.toHaveProperty('requireIdLookup');
	});
});

describe('round 9i: envelope signer Require ID Lookup', () => {
	const run = async (requireIdLookup: string | undefined, typeVersion: number) => {
		const signer: IDataObject = { email: 'a@example.com', name: 'A', idCheckConfigurationName: 'ID Check $' };
		if (requireIdLookup !== undefined) signer.requireIdLookup = requireIdLookup;
		const ctx = createMockContext({
			credentials: C,
			parameters: params({ accountId: 'acct-1', emailSubject: 'S', status: 'created', signers: { signer: [signer] }, documents: { document: [] }, additionalFields: {} }),
			httpResponses: [{}],
			typeVersion,
		});
		await handleEnvelope(ctx, 'create', 0);
		return (getRecordedRequests(ctx)[0].options.body as { recipients: { signers: IDataObject[] } }).recipients.signers[0];
	};
	it('version 4 keeps a chosen No', async () => {
		expect(await run('false', 4)).not.toHaveProperty('requireIdLookup');
	});
	it('version 4 Automatic turns it on with an ID check', async () => {
		expect((await run('', 4)).requireIdLookup).toBe('true');
	});
	it.each([1, 2, 3])('version %i sends only a chosen Yes', async (v) => {
		expect(await run('', v)).not.toHaveProperty('requireIdLookup');
		expect(await run('false', v)).not.toHaveProperty('requireIdLookup');
		expect((await run('true', v)).requireIdLookup).toBe('true');
	});
});
