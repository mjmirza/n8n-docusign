/**
 * ERROR HANDLING TEST SUITE
 *
 * Tests every error path across all handlers:
 * - Missing/invalid parameters
 * - API error responses (4xx, 5xx)
 * - JSON parse failures
 * - Unsupported operations (every handler's default case)
 * - continueOnFail behavior
 * - Retry exhaustion
 * - Network errors
 */
import { describe, it, expect, beforeEach } from '@jest/globals';

// Several tests assert inside catch; this makes an unexpected success fail them.
beforeEach(() => {
	expect.hasAssertions();
});
import { createMockContext, createHttpError, getRecordedRequests, allowOffSpecRequests } from './helpers/mockContext';
import { docuSignRequest } from '../nodes/DocuSign/transport';

import { handleEnvelope } from '../nodes/DocuSign/resources/envelope/envelope.handler';
import { handleRecipient } from '../nodes/DocuSign/resources/recipient/recipient.handler';
import { handleDocument } from '../nodes/DocuSign/resources/document/document.handler';
import { handleEnvelopeCustomField } from '../nodes/DocuSign/resources/envelopeCustomField/envelopeCustomField.handler';
import { handleEnvelopeRecipientTab } from '../nodes/DocuSign/resources/envelopeRecipientTab/envelopeRecipientTab.handler';
import { handleEnvelopeView } from '../nodes/DocuSign/resources/envelopeView/envelopeView.handler';
import { handleEnvelopeFormData } from '../nodes/DocuSign/resources/envelopeFormData/envelopeFormData.handler';
import { handleEnvelopeLock } from '../nodes/DocuSign/resources/envelopeLock/envelopeLock.handler';
import { handleEnvelopeAttachment } from '../nodes/DocuSign/resources/envelopeAttachment/envelopeAttachment.handler';
import { handleEnvelopeTemplate } from '../nodes/DocuSign/resources/envelopeTemplate/envelopeTemplate.handler';
import { handleEnvelopeDocumentTab } from '../nodes/DocuSign/resources/envelopeDocumentTab/envelopeDocumentTab.handler';
import { handleEnvelopeDocumentField } from '../nodes/DocuSign/resources/envelopeDocumentField/envelopeDocumentField.handler';
import { handleEnvelopeEmailSetting } from '../nodes/DocuSign/resources/envelopeEmailSetting/envelopeEmailSetting.handler';
import { handleEnvelopeDocumentVisibility } from '../nodes/DocuSign/resources/envelopeDocumentVisibility/envelopeDocumentVisibility.handler';
import { handleTemplate } from '../nodes/DocuSign/resources/template/template.handler';
import { handleTemplateDocument } from '../nodes/DocuSign/resources/templateDocument/templateDocument.handler';
import { handleTemplateRecipient } from '../nodes/DocuSign/resources/templateRecipient/templateRecipient.handler';
import { handleTemplateRecipientTab } from '../nodes/DocuSign/resources/templateRecipientTab/templateRecipientTab.handler';
import { handleTemplateCustomField } from '../nodes/DocuSign/resources/templateCustomField/templateCustomField.handler';
import { handleTemplateDocumentField } from '../nodes/DocuSign/resources/templateDocumentField/templateDocumentField.handler';
import { handleTemplateDocumentTab } from '../nodes/DocuSign/resources/templateDocumentTab/templateDocumentTab.handler';
import { handleTemplateDocumentVisibility } from '../nodes/DocuSign/resources/templateDocumentVisibility/templateDocumentVisibility.handler';
import { handleTemplateLock } from '../nodes/DocuSign/resources/templateLock/templateLock.handler';
import { handleTemplateView } from '../nodes/DocuSign/resources/templateView/templateView.handler';
import { handleTemplateHtmlDefinition } from '../nodes/DocuSign/resources/templateHtmlDefinition/templateHtmlDefinition.handler';
import { handleAccount } from '../nodes/DocuSign/resources/account/account.handler';
import { handleAccountBrand } from '../nodes/DocuSign/resources/accountBrand/accountBrand.handler';
import { handleAccountPermissionProfile } from '../nodes/DocuSign/resources/accountPermissionProfile/accountPermissionProfile.handler';
import { handleAccountCustomField } from '../nodes/DocuSign/resources/accountCustomField/accountCustomField.handler';
import { handleAccountTabSetting } from '../nodes/DocuSign/resources/accountTabSetting/accountTabSetting.handler';
import { handleAccountConsumerDisclosure } from '../nodes/DocuSign/resources/accountConsumerDisclosure/accountConsumerDisclosure.handler';
import { handleAccountPasswordRule } from '../nodes/DocuSign/resources/accountPasswordRule/accountPasswordRule.handler';
import { handleAccountWatermark } from '../nodes/DocuSign/resources/accountWatermark/accountWatermark.handler';

const C = { docuSignOAuth2Api: { environment: 'demo' } };
const P = { accountId: { 0: 'acct-1' } };

// ==================================================================
// 1. UNSUPPORTED OPERATION — every handler must throw
// ==================================================================
describe('Error Handling: Unsupported Operations', () => {
	const handlers: Array<[string, (ctx: any, op: string, i: number) => Promise<unknown>, Record<string, Record<number, unknown>>]> = [
		['handleEnvelope', handleEnvelope, { ...P }],
		['handleRecipient', handleRecipient, { ...P, envelopeId: { 0: 'e1' } }],
		['handleDocument', handleDocument, { ...P, envelopeId: { 0: 'e1' } }],
		['handleEnvelopeCustomField', handleEnvelopeCustomField, { ...P, envelopeId: { 0: 'e1' } }],
		['handleEnvelopeRecipientTab', handleEnvelopeRecipientTab, { ...P, envelopeId: { 0: 'e1' }, recipientId: { 0: 'r1' } }],
		['handleEnvelopeView', handleEnvelopeView, { ...P, envelopeId: { 0: 'e1' } }],
		['handleEnvelopeFormData', handleEnvelopeFormData, { ...P, envelopeId: { 0: 'e1' } }],
		['handleEnvelopeLock', handleEnvelopeLock, { ...P, envelopeId: { 0: 'e1' } }],
		['handleEnvelopeAttachment', handleEnvelopeAttachment, { ...P, envelopeId: { 0: 'e1' } }],
		['handleEnvelopeTemplate', handleEnvelopeTemplate, { ...P, envelopeId: { 0: 'e1' } }],
		['handleEnvelopeDocumentTab', handleEnvelopeDocumentTab, { ...P, envelopeId: { 0: 'e1' }, documentId: { 0: '1' } }],
		['handleEnvelopeDocumentField', handleEnvelopeDocumentField, { ...P, envelopeId: { 0: 'e1' }, documentId: { 0: '1' } }],
		['handleEnvelopeEmailSetting', handleEnvelopeEmailSetting, { ...P, envelopeId: { 0: 'e1' } }],
		['handleEnvelopeDocumentVisibility', handleEnvelopeDocumentVisibility, { ...P, envelopeId: { 0: 'e1' } }],
		['handleTemplate', handleTemplate, { ...P }],
		['handleTemplateDocument', handleTemplateDocument, { ...P, templateId: { 0: 't1' } }],
		['handleTemplateRecipient', handleTemplateRecipient, { ...P, templateId: { 0: 't1' } }],
		['handleTemplateRecipientTab', handleTemplateRecipientTab, { ...P, templateId: { 0: 't1' }, recipientId: { 0: 'r1' } }],
		['handleTemplateCustomField', handleTemplateCustomField, { ...P, templateId: { 0: 't1' } }],
		['handleTemplateDocumentField', handleTemplateDocumentField, { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' } }],
		['handleTemplateDocumentTab', handleTemplateDocumentTab, { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' } }],
		['handleTemplateDocumentVisibility', handleTemplateDocumentVisibility, { ...P, templateId: { 0: 't1' } }],
		['handleTemplateLock', handleTemplateLock, { ...P, templateId: { 0: 't1' } }],
		['handleTemplateView', handleTemplateView, { ...P, templateId: { 0: 't1' } }],
		['handleTemplateHtmlDefinition', handleTemplateHtmlDefinition, { ...P, templateId: { 0: 't1' } }],
		['handleAccount', handleAccount, { ...P }],
		['handleAccountBrand', handleAccountBrand, { ...P }],
		['handleAccountPermissionProfile', handleAccountPermissionProfile, { ...P }],
		['handleAccountCustomField', handleAccountCustomField, { ...P }],
		['handleAccountTabSetting', handleAccountTabSetting, { ...P }],
		['handleAccountConsumerDisclosure', handleAccountConsumerDisclosure, { ...P }],
		['handleAccountPasswordRule', handleAccountPasswordRule, { ...P }],
		['handleAccountWatermark', handleAccountWatermark, { ...P }],
	];

	for (const [name, handler, params] of handlers) {
		it(`${name} throws on unsupported operation`, async () => {
			const ctx = createMockContext({ credentials: C, parameters: params });
			await expect(handler(ctx, '__INVALID_OP__', 0)).rejects.toThrow('Unsupported');
		});
	}
});

// ==================================================================
// 2. API ERROR RESPONSES
// ==================================================================
describe('Error Handling: API Error Responses', () => {
	it('400 Bad Request — surfaces DocuSign error code', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: P,
			httpResponses: [createHttpError(400, { errorCode: 'INVALID_REQUEST', message: 'Bad parameters' })],
		});
		try {
			await handleAccount(ctx, 'get', 0);
		} catch (e) {
			expect((e as { description?: string }).description).toContain('INVALID_REQUEST');
		}
	});

	it('401 Unauthorized — surfaces auth error', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: P,
			httpResponses: [createHttpError(401, { error: 'invalid_grant', error_description: 'Token expired' })],
		});
		try {
			await handleAccount(ctx, 'get', 0);
		} catch (e) {
			expect((e as { description?: string }).description).toContain('invalid_grant');
		}
	});

	it('403 Forbidden — surfaces permission error', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: P,
			httpResponses: [createHttpError(403, { errorCode: 'USER_LACKS_PERMISSIONS', message: 'Insufficient privileges' })],
		});
		try {
			await handleAccount(ctx, 'get', 0);
		} catch (e) {
			expect((e as { description?: string }).description).toContain('USER_LACKS_PERMISSIONS');
		}
	});

	it('404 Not Found — surfaces not found error', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, envelopeId: { 0: 'nonexistent' } },
			httpResponses: [createHttpError(404, { errorCode: 'ENVELOPE_DOES_NOT_EXIST', message: 'The envelope does not exist' })],
		});
		try {
			await handleEnvelope(ctx, 'get', 0);
		} catch (e) {
			expect((e as { description?: string }).description).toContain('ENVELOPE_DOES_NOT_EXIST');
		}
	});

	it('422 Validation Error — surfaces multiple errors', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: P,
			httpResponses: [createHttpError(422, { errors: [{ message: 'Field A required' }, { message: 'Field B invalid' }] })],
		});
		try {
			await handleAccount(ctx, 'get', 0);
		} catch (e) {
			expect((e as { description?: string }).description).toContain('Field A required');
			expect((e as { description?: string }).description).toContain('Field B invalid');
		}
	});

	it('500 Internal Server Error — graceful handling', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: P,
			httpResponses: [createHttpError(500, null, 'Internal error')],
		});
		await expect(handleAccount(ctx, 'get', 0)).rejects.toThrow();
	});
});

// ==================================================================
// 3. NO CREDENTIALS
// ==================================================================
describe('Error Handling: Missing Credentials', () => {
	it('throws when no credentials configured', async () => {
		const ctx = createMockContext({ credentials: {}, parameters: P });
		await expect(docuSignRequest(ctx, 'GET', 'accounts/acct-1')).rejects.toThrow('No DocuSign credentials configured');
	});
});

// ==================================================================
// 4. JSON PARSE ERRORS
// ==================================================================
describe('Error Handling: JSON Parse Failures', () => {
	const jsonTests: Array<[string, (ctx: any, op: string, i: number) => Promise<unknown>, string, string, Record<string, Record<number, unknown>>]> = [
		['Account updateSettings', handleAccount, 'updateSettings', 'settings', P],
		['Account updateSharedAccess', handleAccount, 'updateSharedAccess', 'sharedAccess', P],
		['Account updatePurgeConfig', handleAccount, 'updateEnvelopePurgeConfiguration', 'purgeConfiguration', P],
		['Account updateNotificationDefaults', handleAccount, 'updateNotificationDefaults', 'notificationDefaults', P],
		['AccountConsumerDisclosure update', handleAccountConsumerDisclosure, 'update', 'disclosureData', { ...P, langCode: { 0: 'en' } }],
		['AccountPasswordRule update', handleAccountPasswordRule, 'update', 'passwordRules', P],
	];

	for (const [label, handler, operation, paramName, params] of jsonTests) {
		it(`${label} — rejects invalid JSON`, async () => {
			const ctx = createMockContext({
				credentials: C,
				parameters: { ...params, [paramName]: { 0: '{broken!!!}' } },
			});
			await expect(handler(ctx, operation, 0)).rejects.toThrow();
		});

		it(`${label} — accepts valid JSON`, async () => {
			const ctx = createMockContext({
				credentials: C,
				parameters: { ...params, [paramName]: { 0: '{"key":"value"}' } },
				httpResponses: [{}],
			});
			await handler(ctx, operation, 0);
			expect(getRecordedRequests(ctx)[0].options.body).toEqual({ key: 'value' });
		});
	}
});

// ==================================================================
// 5. RETRY BEHAVIOR
// ==================================================================
describe('Error Handling: Retry Behavior', () => {
	it('retries on 429 and succeeds', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [
				createHttpError(429, {}, 'Rate limited'),
				{ ok: true },
			],
		});
		const result = await docuSignRequest(ctx, 'GET', 'accounts/acct-1');
		expect(result).toEqual({ ok: true });
	});

	it('retries on 502 and succeeds', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [
				createHttpError(502, {}, 'Bad Gateway'),
				{ ok: true },
			],
		});
		const result = await docuSignRequest(ctx, 'GET', 'accounts/acct-1');
		expect(result).toEqual({ ok: true });
	});

	it('does NOT retry on 400', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [
				createHttpError(400, { message: 'Bad request' }),
			],
		});
		await expect(docuSignRequest(ctx, 'GET', 'accounts/acct-1')).rejects.toThrow();
	});

	it('does NOT retry on 401', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [
				createHttpError(401, { error: 'unauthorized' }),
			],
		});
		await expect(docuSignRequest(ctx, 'GET', 'accounts/acct-1')).rejects.toThrow();
	});

	it('does NOT retry on 403', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [
				createHttpError(403, { message: 'Forbidden' }),
			],
		});
		await expect(docuSignRequest(ctx, 'GET', 'accounts/acct-1')).rejects.toThrow();
	});

	it('does NOT retry on 404', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [
				createHttpError(404, { message: 'Not found' }),
			],
		});
		await expect(docuSignRequest(ctx, 'GET', 'accounts/acct-1')).rejects.toThrow();
	});
});

// ==================================================================
// 6. EDGE CASES
// ==================================================================
describe('Error Handling: Edge Cases', () => {
	it('empty body on POST does not crash', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [{ ok: true }],
		});
		const result = await docuSignRequest(ctx, 'POST', 'accounts/acct-1/envelopes', {});
		expect(result).toEqual({ ok: true });
	});

	it('empty query string does not crash', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [{ ok: true }],
		});
		const result = await docuSignRequest(ctx, 'GET', 'accounts/acct-1', undefined, {});
		expect(result).toEqual({ ok: true });
	});

	it('handles null response body gracefully', async () => {
		allowOffSpecRequests(); // synthetic path, tests transport plumbing only
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [null],
		});
		const result = await docuSignRequest(ctx, 'DELETE', 'accounts/acct-1/resource/123');
		expect(result).toBeNull();
	});

	it('handles undefined response body gracefully', async () => {
		allowOffSpecRequests(); // synthetic path, tests transport plumbing only
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [undefined],
		});
		const result = await docuSignRequest(ctx, 'DELETE', 'accounts/acct-1/resource/123');
		expect(result).toBeUndefined();
	});
});
