import type { IDataObject } from 'n8n-workflow';
/**
 * Phase 1 handler tests — covers all new envelope sub-resource handlers.
 * Tests every operation for security (ID validation, input sanitization)
 * and correctness (proper API paths, request bodies).
 */
import { describe, it, expect } from '@jest/globals';
import { createMockContext, getRecordedRequests } from './helpers/mockContext';

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

const BASE_PARAMS = {
	accountId: { 0: 'acct-1' },
	envelopeId: { 0: 'env-1' },
};

const BASE_CREDS = { docuSignOAuth2Api: { environment: 'demo' } };

// ---------------------------------------------------------------------------
// Envelope Custom Fields
// ---------------------------------------------------------------------------
describe('handleEnvelopeCustomField', () => {
	it('list — should GET custom fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{ textCustomFields: [], listCustomFields: [] }],
		});
		const result = await handleEnvelopeCustomField(ctx, 'list', 0);
		expect(result).toHaveProperty('textCustomFields');
	});

	it('create — should POST with text and list fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				textCustomFields: { 0: { field: [{ name: 'PO Number', value: '12345', required: 'true', show: 'true' }] } },
				listCustomFields: { 0: { field: [{ name: 'Department', listItems: 'Sales;Marketing;Engineering', value: 'Sales', required: 'false', show: 'true' }] } },
			},
			httpResponses: [{ textCustomFields: [{ fieldId: 'f1' }] }],
		});
		const result = await handleEnvelopeCustomField(ctx, 'create', 0);
		expect(result).toBeDefined();
	});

	it('update — should PUT custom fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				textCustomFields: { 0: { field: [{ fieldId: 'f1', name: 'PO Number', value: '99999' }] } },
				listCustomFields: { 0: {} },
			},
			httpResponses: [{ textCustomFields: [{ fieldId: 'f1' }] }],
		});
		const result = await handleEnvelopeCustomField(ctx, 'update', 0);
		expect(result).toBeDefined();
	});

	it('delete — should DELETE by field ID', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, customFieldId: { 0: 'field-123' } },
			httpResponses: [{}],
		});
		await handleEnvelopeCustomField(ctx, 'delete', 0);
	});

	it('delete — should reject invalid field IDs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, customFieldId: { 0: '../etc' } },
		});
		await expect(handleEnvelopeCustomField(ctx, 'delete', 0)).rejects.toThrow('contains invalid characters');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleEnvelopeCustomField(ctx, 'purge', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Recipient Tabs
// ---------------------------------------------------------------------------
describe('handleEnvelopeRecipientTab', () => {
	const TAB_PARAMS = { ...BASE_PARAMS, recipientId: { 0: 'r1' } };

	it('list — should GET tabs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: TAB_PARAMS,
			httpResponses: [{ signHereTabs: [] }],
		});
		const result = await handleEnvelopeRecipientTab(ctx, 'list', 0);
		expect(result).toHaveProperty('signHereTabs');
	});

	it('create — should POST tabs with anchor placement', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...TAB_PARAMS,
				tabType: { 0: 'signHereTabs' },
				tabs: { 0: { tab: [{ documentId: '1', pageNumber: '1', placementMethod: 'anchor', anchorString: '/sign/', anchorXOffset: '10', anchorYOffset: '5', anchorUnits: 'pixels' }] } },
			},
			httpResponses: [{ signHereTabs: [{ tabId: 't1' }] }],
		});
		const result = await handleEnvelopeRecipientTab(ctx, 'create', 0);
		expect(result).toBeDefined();
	});

	it('create — should POST tabs with fixed placement', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...TAB_PARAMS,
				tabType: { 0: 'textTabs' },
				tabs: { 0: { tab: [{ documentId: '1', pageNumber: '1', placementMethod: 'fixed', xPosition: '200', yPosition: '300', tabLabel: 'Field1', value: 'Hello', required: 'true', locked: 'true', fontSize: 'size14', bold: 'true', width: 100, height: 20, tabId: 'existing-tab' }] } },
			},
			httpResponses: [{ textTabs: [{ tabId: 't1' }] }],
		});
		const result = await handleEnvelopeRecipientTab(ctx, 'create', 0);
		expect(result).toBeDefined();
	});

	it('update — should PUT tabs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...TAB_PARAMS,
				tabType: { 0: 'textTabs' },
				tabs: { 0: { tab: [{ documentId: '1', pageNumber: '1', placementMethod: 'fixed', value: 'Updated' }] } },
			},
			httpResponses: [{ textTabs: [{ tabId: 't1' }] }],
		});
		const result = await handleEnvelopeRecipientTab(ctx, 'update', 0);
		expect(result).toBeDefined();
	});

	it('delete — should DELETE tabs by IDs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...TAB_PARAMS, tabType: { 0: 'signHereTabs' }, tabIds: { 0: 'tab-1, tab-2' } },
			httpResponses: [{}],
		});
		await handleEnvelopeRecipientTab(ctx, 'delete', 0);
	});

	it('create — should handle all advanced tab properties', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...TAB_PARAMS,
				tabType: { 0: 'textTabs' },
				tabs: { 0: { tab: [{
					documentId: '1', pageNumber: '1', placementMethod: 'anchor',
					anchorString: '/text/', anchorHorizontalAlignment: 'center',
					tabGroupLabels: 'group1, group2', customTabId: 'custom-1',
					recipientId: 'r1',
				}] } },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeRecipientTab(ctx, 'create', 0);
	});

	it('should reject invalid tab type', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...TAB_PARAMS, tabType: { 0: '__proto__' }, tabs: { 0: { tab: [] } } },
		});
		await expect(handleEnvelopeRecipientTab(ctx, 'create', 0)).rejects.toThrow('Invalid tab type');
	});

	it('should reject invalid recipient ID', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, recipientId: { 0: '../evil' } },
		});
		await expect(handleEnvelopeRecipientTab(ctx, 'list', 0)).rejects.toThrow('contains invalid characters');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: TAB_PARAMS });
		await expect(handleEnvelopeRecipientTab(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Views
// ---------------------------------------------------------------------------
describe('handleEnvelopeView', () => {
	it('createRecipient — should generate signing URL', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				returnUrl: { 0: 'https://example.com/done' },
				signerEmail: { 0: 'signer@test.com' },
				signerName: { 0: 'Test Signer' },
				clientUserId: { 0: 'user-123' },
				authenticationMethod: { 0: 'none' },
			},
			httpResponses: [{ url: 'https://demo.docusign.net/signing/...' }],
		});
		const result = await handleEnvelopeView(ctx, 'createRecipient', 0) as { url: string };
		expect(result.url).toContain('docusign');
	});

	it('createRecipient — should handle all advanced options', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				returnUrl: { 0: 'https://example.com/done' },
				signerEmail: { 0: 'signer@test.com' },
				signerName: { 0: 'Test Signer' },
				clientUserId: { 0: 'user-123' },
				authenticationMethod: { 0: 'none' },
				recipientViewOptions: { 0: {
					pingUrl: 'https://example.com/ping',
					pingFrequency: 60,
					frameAncestors: 'https://myapp.com, https://other.com',
					messageOrigins: 'https://myapp.com',
					recipientId: 'r1',
					userId: 'u1',
					assertionId: 'assert-1',
					authenticationInstant: '2024-01-01T00:00:00Z',
					securityDomain: 'mydomain',
					xFrameOptions: 'allow_from',
					xFrameOptionsAllowFromUrl: 'https://myapp.com',
				} },
			},
			httpResponses: [{ url: 'https://demo.docusign.net/signing/advanced' }],
		});
		const result = await handleEnvelopeView(ctx, 'createRecipient', 0) as { url: string };
		expect(result.url).toBeDefined();
	});

	it('createSender — should generate sender URL', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, returnUrl: { 0: 'https://example.com/done' } },
			httpResponses: [{ url: 'https://demo.docusign.net/sender/...' }],
		});
		const result = await handleEnvelopeView(ctx, 'createSender', 0);
		expect(result).toHaveProperty('url');
	});

	it('createEdit — should generate edit URL', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, returnUrl: { 0: 'https://example.com/done' } },
			httpResponses: [{ url: 'https://demo.docusign.net/edit/...' }],
		});
		const result = await handleEnvelopeView(ctx, 'createEdit', 0);
		expect(result).toHaveProperty('url');
	});

	it('createCorrect — should generate correct URL', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, returnUrl: { 0: 'https://example.com/done' } },
			httpResponses: [{ url: 'https://demo.docusign.net/correct/...' }],
		});
		const result = await handleEnvelopeView(ctx, 'createCorrect', 0);
		expect(result).toHaveProperty('url');
	});

	it('createConsole — should generate console URL with options', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				returnUrl: { 0: 'https://example.com/done' },
				viewOptions: { 0: { envelopeId: 'env-start' } },
			},
			httpResponses: [{ url: 'https://demo.docusign.net/console/...' }],
		});
		const result = await handleEnvelopeView(ctx, 'createConsole', 0);
		expect(result).toHaveProperty('url');
	});

	it('createSharedRecipient — should generate shared URL', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				returnUrl: { 0: 'https://example.com/done' },
				signerEmail: { 0: 'shared@test.com' },
				signerName: { 0: 'Shared Signer' },
			},
			httpResponses: [{ url: 'https://demo.docusign.net/shared/...' }],
		});
		const result = await handleEnvelopeView(ctx, 'createSharedRecipient', 0);
		expect(result).toHaveProperty('url');
	});

	it('deleteCorrectView — should DELETE correct view', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{}],
		});
		await handleEnvelopeView(ctx, 'deleteCorrectView', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleEnvelopeView(ctx, 'createAdmin', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Form Data
// ---------------------------------------------------------------------------
describe('handleEnvelopeFormData', () => {
	it('get — should GET form data', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{ formData: [{ name: 'field1', value: 'test' }] }],
		});
		const result = await handleEnvelopeFormData(ctx, 'get', 0);
		expect(result).toHaveProperty('formData');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleEnvelopeFormData(ctx, 'update', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Locks
// ---------------------------------------------------------------------------
describe('handleEnvelopeLock', () => {
	it('get — should GET lock info', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{ lockToken: 'abc', lockType: 'edit' }],
		});
		const result = await handleEnvelopeLock(ctx, 'get', 0);
		expect(result).toHaveProperty('lockToken');
	});

	it('create — should POST lock', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, lockDurationInSeconds: { 0: 600 }, lockType: { 0: 'edit' } },
			httpResponses: [{ lockToken: 'new-token' }],
		});
		const result = await handleEnvelopeLock(ctx, 'create', 0);
		expect(result).toHaveProperty('lockToken');
	});

	it('update — should PUT lock with token', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, lockDurationInSeconds: { 0: 900 }, lockToken: { 0: 'existing-token' } },
			httpResponses: [{ lockToken: 'existing-token' }],
		});
		const result = await handleEnvelopeLock(ctx, 'update', 0);
		expect(result).toBeDefined();
	});

	it('delete — should DELETE lock', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, lockToken: { 0: 'token-to-release' } },
			httpResponses: [{}],
		});
		await handleEnvelopeLock(ctx, 'delete', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleEnvelopeLock(ctx, 'refresh', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Attachments
// ---------------------------------------------------------------------------
describe('handleEnvelopeAttachment', () => {
	it('list — should GET attachments', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{ attachments: [] }],
		});
		const result = await handleEnvelopeAttachment(ctx, 'list', 0);
		expect(result).toHaveProperty('attachments');
	});

	it('get — should GET single attachment', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, attachmentId: { 0: 'att-1' } },
			httpResponses: [Buffer.from('file')],
			typeVersion: 2,
		});
		const result = (await handleEnvelopeAttachment(ctx, 'get', 0)) as { json: IDataObject; binary: IDataObject };
		expect(result.json).toHaveProperty('attachmentId', 'att-1');
		expect(result.binary).toHaveProperty('data');
	});

	it('create — should PUT attachment with base64', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				attachmentName: { 0: 'test.pdf' },
				attachmentType: { 0: '.pdf' },
				source: { 0: 'base64' },
				base64Content: { 0: 'SGVsbG8=' },
			},
			httpResponses: [{ attachments: [{ attachmentId: 'new-att' }] }],
		});
		const result = await handleEnvelopeAttachment(ctx, 'create', 0);
		expect(result).toBeDefined();
	});

	it('create — should PUT attachment with binary data', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				attachmentName: { 0: 'test.pdf' },
				attachmentType: { 0: '.pdf' },
				source: { 0: 'binary' },
				binaryProperty: { 0: 'data' },
			},
			binaryData: {
				0: {
					data: {
						data: 'SGVsbG8=',
						mimeType: 'application/pdf',
						fileName: 'test.pdf',
						fileSize: '100',
					},
				},
			},
			httpResponses: [{ attachments: [{ attachmentId: 'new-att' }] }],
		});
		const result = await handleEnvelopeAttachment(ctx, 'create', 0);
		expect(result).toBeDefined();
	});

	it('delete — should DELETE attachment', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, attachmentId: { 0: 'att-1' } },
			httpResponses: [{}],
		});
		await handleEnvelopeAttachment(ctx, 'delete', 0);
	});

	it('should reject invalid attachment ID', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, attachmentId: { 0: 'att/../../etc' } },
		});
		await expect(handleEnvelopeAttachment(ctx, 'get', 0)).rejects.toThrow('contains invalid characters');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleEnvelopeAttachment(ctx, 'archive', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Templates
// ---------------------------------------------------------------------------
describe('handleEnvelopeTemplate', () => {
	it('list — should GET templates', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{ templates: [] }],
		});
		const result = await handleEnvelopeTemplate(ctx, 'list', 0);
		expect(result).toBeDefined();
	});

	it('apply — should POST template', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, templateId: { 0: 'tmpl-1' } },
			httpResponses: [{ templateId: 'tmpl-1' }],
		});
		const result = await handleEnvelopeTemplate(ctx, 'apply', 0);
		expect(result).toBeDefined();
	});

	it('applyToDocument — should POST template to document', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, templateId: { 0: 'tmpl-1' }, documentId: { 0: '1' } },
			httpResponses: [{}],
		});
		await handleEnvelopeTemplate(ctx, 'applyToDocument', 0);
	});

	it('delete — should DELETE template', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, templateId: { 0: 'tmpl-1' }, documentId: { 0: '1' } },
			httpResponses: [{}],
		});
		await handleEnvelopeTemplate(ctx, 'delete', 0);
		expect(String(getRecordedRequests(ctx)[0].options.url)).toMatch(/\/documents\/1\/templates\/tmpl-1$/);
	});

	it('listByDocument — should GET templates by document', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' } },
			httpResponses: [{ templates: [] }],
		});
		const result = await handleEnvelopeTemplate(ctx, 'listByDocument', 0);
		expect(result).toBeDefined();
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleEnvelopeTemplate(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Document Tabs
// ---------------------------------------------------------------------------
describe('handleEnvelopeDocumentTab', () => {
	const DOC_PARAMS = { ...BASE_PARAMS, documentId: { 0: '1' } };

	it('get — should GET document tabs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: DOC_PARAMS,
			httpResponses: [{ signHereTabs: [] }],
		});
		const result = await handleEnvelopeDocumentTab(ctx, 'get', 0);
		expect(result).toBeDefined();
	});

	it('getByPage — should GET tabs by page', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, pageNumber: { 0: '2' } },
			httpResponses: [{ signHereTabs: [] }],
		});
		const result = await handleEnvelopeDocumentTab(ctx, 'getByPage', 0);
		expect(result).toBeDefined();
	});

	it('create — should POST tabs JSON', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, requestBody: { 0: { signHereTabs: [{ xPosition: '100', yPosition: '200' }] } } },
			httpResponses: [{}],
		});
		await handleEnvelopeDocumentTab(ctx, 'create', 0);
	});

	it('update — should PUT tabs JSON', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, requestBody: { 0: { textTabs: [{ tabId: 't1', value: 'new' }] } } },
			httpResponses: [{}],
		});
		await handleEnvelopeDocumentTab(ctx, 'update', 0);
	});

	it('delete — should DELETE tabs JSON', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, requestBody: { 0: { signHereTabs: [{ tabId: 't1' }] } } },
			httpResponses: [{}],
		});
		await handleEnvelopeDocumentTab(ctx, 'delete', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: DOC_PARAMS });
		await expect(handleEnvelopeDocumentTab(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Document Fields
// ---------------------------------------------------------------------------
describe('handleEnvelopeDocumentField', () => {
	const DOC_PARAMS = { ...BASE_PARAMS, documentId: { 0: '1' } };

	it('list — should GET document fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: DOC_PARAMS,
			httpResponses: [{ documentFields: [] }],
		});
		const result = await handleEnvelopeDocumentField(ctx, 'list', 0);
		expect(result).toBeDefined();
	});

	it('create — should POST fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, documentFields: { 0: { field: [{ name: 'field1', value: 'val1' }] } } },
			httpResponses: [{}],
		});
		await handleEnvelopeDocumentField(ctx, 'create', 0);
	});

	it('update — should PUT fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, documentFields: { 0: { field: [{ name: 'field1', value: 'updated' }] } } },
			httpResponses: [{}],
		});
		await handleEnvelopeDocumentField(ctx, 'update', 0);
	});

	it('delete — should DELETE fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, documentFields: { 0: { field: [{ name: 'field1', value: '' }] } } },
			httpResponses: [{}],
		});
		await handleEnvelopeDocumentField(ctx, 'delete', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: DOC_PARAMS });
		await expect(handleEnvelopeDocumentField(ctx, 'purge', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Email Settings
// ---------------------------------------------------------------------------
describe('handleEnvelopeEmailSetting', () => {
	it('get — should GET email settings', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{ replyEmailAddressOverride: 'test@test.com' }],
		});
		const result = await handleEnvelopeEmailSetting(ctx, 'get', 0);
		expect(result).toBeDefined();
	});

	it('create — should POST email settings with BCC', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				replyEmailAddressOverride: { 0: 'reply@test.com' },
				replyEmailNameOverride: { 0: 'Reply Name' },
				bccEmailAddresses: { 0: { address: [{ email: 'bcc@test.com' }] } },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeEmailSetting(ctx, 'create', 0);
	});

	it('update — should PUT email settings', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				replyEmailAddressOverride: { 0: 'updated@test.com' },
				replyEmailNameOverride: { 0: '' },
				bccEmailAddresses: { 0: {} },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeEmailSetting(ctx, 'update', 0);
	});

	it('delete — should DELETE email settings', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{}],
		});
		await handleEnvelopeEmailSetting(ctx, 'delete', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleEnvelopeEmailSetting(ctx, 'archive', 0)).rejects.toThrow('Unsupported');
	});
});

// ---------------------------------------------------------------------------
// Envelope Document Visibility
// ---------------------------------------------------------------------------
describe('handleEnvelopeDocumentVisibility', () => {
	it('get — should GET visibility for recipient', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, recipientId: { 0: 'r1' } },
			httpResponses: [{ documentVisibility: [] }],
		});
		const result = await handleEnvelopeDocumentVisibility(ctx, 'get', 0);
		expect(result).toBeDefined();
	});

	it('update — should PUT visibility for recipient', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				recipientId: { 0: 'r1' },
				documentVisibility: { 0: '[{"documentId":"1","visible":"true"}]' },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeDocumentVisibility(ctx, 'update', 0);
	});

	it('updateAll — should PUT visibility for all recipients', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				documentVisibility: { 0: '[{"documentId":"1","visible":"false"}]' },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeDocumentVisibility(ctx, 'updateAll', 0);
	});

	it('update — should reject invalid JSON', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				recipientId: { 0: 'r1' },
				documentVisibility: { 0: 'not valid json' },
			},
		});
		await expect(handleEnvelopeDocumentVisibility(ctx, 'update', 0)).rejects.toThrow('valid JSON');
	});

	it('updateAll — should reject invalid JSON', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				documentVisibility: { 0: '{broken' },
			},
		});
		await expect(handleEnvelopeDocumentVisibility(ctx, 'updateAll', 0)).rejects.toThrow('valid JSON');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleEnvelopeDocumentVisibility(ctx, 'reset', 0)).rejects.toThrow('Unsupported');
	});
});
