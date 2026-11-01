/**
 * Phase 2 handler tests — covers all template sub-resource handlers.
 * Tests every operation for security (ID validation) and correctness.
 */
import { describe, it, expect } from '@jest/globals';
import { createMockContext, getRecordedRequests } from './helpers/mockContext';

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

const BASE_PARAMS = { accountId: { 0: 'acct-1' }, templateId: { 0: 'tmpl-1' } };
const BASE_CREDS = { docuSignOAuth2Api: { environment: 'demo' } };

// ==================================================================
// Template (Core) — expanded operations
// ==================================================================
describe('handleTemplate (expanded)', () => {
	it('get — should GET template by ID', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{ templateId: 'tmpl-1', name: 'Test' }],
		});
		const result = await handleTemplate(ctx, 'get', 0) as { templateId: string };
		expect(result.templateId).toBe('tmpl-1');
	});

	it('getAll — should GET templates with filters', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				maxResults: { 0: 50 },
				filters: { 0: { searchText: 'invoice', folder: 'shared', folderIds: 'f1,f2', sharedByMe: 'true', orderBy: 'modified', order: 'desc' } },
			},
			httpResponses: [{
				envelopeTemplates: [{ templateId: 't1' }],
				totalSetSize: '1',
				resultSetSize: '1',
			}],
		});
		const result = await handleTemplate(ctx, 'getAll', 0) as unknown[];
		expect(result).toHaveLength(1);
	});

	it('create — should POST template with documents and recipients', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				templateName: { 0: 'My Template' },
				description: { 0: 'Test template' },
				emailSubject: { 0: 'Please sign' },
				documents: { 0: { document: [{ name: 'doc.pdf', documentId: '1', source: 'base64', documentBase64: 'SGVsbG8=', fileExtension: 'pdf' }] } },
				recipients: { 0: { signer: [{ roleName: 'Signer 1', recipientId: '1', routingOrder: '1' }] } },
				additionalFields: { 0: { emailBlurb: 'Please review', brandId: 'brand-1', shared: 'true', autoMatch: 'true', expireAfter: 90, reminderDelay: 5 } },
			},
			httpResponses: [{ templateId: 'new-tmpl' }],
		});
		const result = await handleTemplate(ctx, 'create', 0) as { templateId: string };
		expect(result.templateId).toBe('new-tmpl');
	});

	it('update — should PUT update fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, updateFields: { 0: { name: 'Updated Name', description: 'New desc', shared: 'true' } } },
			httpResponses: [{ ok: true }],
		});
		await handleTemplate(ctx, 'update', 0);
	});

	it('deleteDocumentPage — should DELETE page', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' }, pageNumber: { 0: '3' } },
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'deleteDocumentPage', 0);
	});

	it('getNotificationSettings — should GET notification', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: BASE_PARAMS,
			httpResponses: [{ reminders: {}, expirations: {} }],
		});
		const result = await handleTemplate(ctx, 'getNotificationSettings', 0);
		expect(result).toBeDefined();
	});

	it('updateNotificationSettings — should PUT reminders and expirations', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, notificationSettings: { 0: { reminderEnabled: 'true', reminderDelay: 3, reminderFrequency: 2, expireEnabled: 'true', expireAfter: 60, expireWarn: 5 } } },
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'updateNotificationSettings', 0);
	});

	it('updateNotificationSettings — should PUT reminders only', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, notificationSettings: { 0: { reminderEnabled: 'false' } } },
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'updateNotificationSettings', 0);
	});

	it('updateNotificationSettings — should PUT expirations only', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, notificationSettings: { 0: { expireEnabled: 'true' } } },
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'updateNotificationSettings', 0);
	});

	it('getPageImages — should GET page images', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' } },
			httpResponses: [{ pages: [] }],
		});
		await handleTemplate(ctx, 'getPageImages', 0);
	});

	it('rotateDocumentPage — should PUT rotation', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' }, pageNumber: { 0: '1' }, rotation: { 0: 'clockwise90' } },
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'rotateDocumentPage', 0);
	});

	it('updateGroupShare — should PUT group share', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, groupIds: { 0: 'grp-1, grp-2' } },
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'updateGroupShare', 0);
	});

	it('deleteGroupShare — should DELETE group share', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, groupIds: { 0: 'grp-1' } },
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'deleteGroupShare', 0);
	});

	it('create — should handle binary documents', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				templateName: { 0: 'Binary Template' },
				emailSubject: { 0: 'Sign' },
				documents: { 0: { document: [{ name: 'doc.pdf', documentId: '1', source: 'binary', binaryProperty: 'data', fileExtension: 'pdf' }] } },
				recipients: { 0: { signer: [{ roleName: 'Signer 1', recipientId: '1', routingOrder: '1', email: 'a@b.com', name: 'Signer', accessCode: '1234', idCheckConfigurationName: 'ID Check $', deliveryMethod: 'sms', emailNotificationSubject: 'Custom' }] } },
				additionalFields: { 0: { carbonCopies: { recipient: [{ roleName: 'CC', recipientId: '10', routingOrder: '2', email: 'cc@b.com', name: 'CC' }] } } },
			},
			binaryData: { 0: { data: { data: 'SGVsbG8=', mimeType: 'application/pdf', fileName: 'test.pdf', fileSize: '100' } } },
			httpResponses: [{ templateId: 'new-tmpl-2' }],
		});
		const result = await handleTemplate(ctx, 'create', 0) as { templateId: string };
		expect(result.templateId).toBe('new-tmpl-2');
	});

	it('create — should handle remoteUrl documents', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				templateName: { 0: 'URL Template' },
				emailSubject: { 0: 'Sign' },
				documents: { 0: { document: [{ name: 'doc.pdf', documentId: '1', source: 'remoteUrl', remoteUrl: 'https://example.com/doc.pdf', fileExtension: 'pdf', order: 1, transformPdfFields: 'true', includeInDownload: 'false' }] } },
				recipients: { 0: {} },
				additionalFields: { 0: { password: 'secret', signingLocation: 'inPerson' } },
			},
			httpResponses: [{ templateId: 'new-tmpl-3' }],
		});
		await handleTemplate(ctx, 'create', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleTemplate(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template Document
// ==================================================================
describe('handleTemplateDocument', () => {
	it('list — should GET documents', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS, httpResponses: [{ templateDocuments: [] }] });
		await handleTemplateDocument(ctx, 'list', 0);
	});

	it('get — should download document as binary', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' }, binaryPropertyName: { 0: 'data' } },
			httpResponses: [Buffer.from('PDF content')],
		});
		const result = await handleTemplateDocument(ctx, 'get', 0) as { binary: Record<string, unknown> };
		expect(result.binary.data).toBeDefined();
	});

	it('delete — should DELETE document', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '2' } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'delete', 0);
		const req = getRecordedRequests(ctx)[0].options;
		expect(req.method).toBe('DELETE');
		expect(String(req.url)).toMatch(/\/templates\/[^/]+\/documents$/);
		expect(req.body).toEqual({ documents: [{ documentId: '2' }] });
	});

	it('update — should PUT document with binary', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' }, documentData: { 0: { content: [{ source: 'binary', binaryProperty: 'data', name: 'updated.pdf', fileExtension: 'pdf' }] } } },
			binaryData: { 0: { data: { data: 'SGVsbG8=', mimeType: 'application/pdf', fileName: 'test.pdf', fileSize: '100' } } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'update', 0);
	});

	it('update — should PUT document with base64', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' }, documentData: { 0: { content: [{ source: 'base64', documentBase64: 'SGVsbG8=', name: 'updated.pdf', fileExtension: 'pdf' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'update', 0);
	});

	it('update — should throw without content', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' }, documentData: { 0: { content: [{ source: 'base64' }] } } },
		});
		await expect(handleTemplateDocument(ctx, 'update', 0)).rejects.toThrow('Document content is required');
	});

	it('updateList — should PUT multiple documents', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentsJson: { 0: '[{"documentId":"1","name":"doc1"}]' } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'updateList', 0);
	});

	it('updateList — should reject invalid JSON', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentsJson: { 0: 'not json' } },
		});
		await expect(handleTemplateDocument(ctx, 'updateList', 0)).rejects.toThrow('valid JSON');
	});

	it('should reject invalid document ID', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '../etc' } },
		});
		await expect(handleTemplateDocument(ctx, 'delete', 0)).rejects.toThrow('contains invalid characters');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleTemplateDocument(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template Recipient
// ==================================================================
describe('handleTemplateRecipient', () => {
	it('list — should GET recipients', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS, httpResponses: [{ signers: [] }] });
		await handleTemplateRecipient(ctx, 'list', 0);
	});

	it('create — should POST recipient with all fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				recipientType: { 0: 'signers' },
				roleName: { 0: 'Manager' },
				routingOrder: { 0: '1' },
				additionalFields: { 0: { email: 'mgr@test.com', name: 'Manager', accessCode: '1234', deliveryMethod: 'sms', emailNotificationSubject: 'Custom Subject' } },
			},
			httpResponses: [{ signers: [{ recipientId: '1' }] }],
		});
		await handleTemplateRecipient(ctx, 'create', 0);
	});

	it('update — should PUT recipient', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, recipientType: { 0: 'signers' }, recipientId: { 0: 'r1' }, updateFields: { 0: { roleName: 'Updated Role', email: 'new@test.com' } } },
			httpResponses: [{}],
		});
		await handleTemplateRecipient(ctx, 'update', 0);
	});

	it('delete — should DELETE recipient', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, recipientId: { 0: 'r1' } },
			httpResponses: [{}],
		});
		await handleTemplateRecipient(ctx, 'delete', 0);
	});

	it('deleteList — should DELETE multiple recipients', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, recipientIds: { 0: 'r1, r2, r3' } },
			httpResponses: [{}],
		});
		await handleTemplateRecipient(ctx, 'deleteList', 0);
	});

	it('createPreview — should POST preview', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, returnUrl: { 0: 'https://example.com/done' } },
			httpResponses: [{ url: 'https://demo.docusign.net/preview/...' }],
		});
		await handleTemplateRecipient(ctx, 'createPreview', 0);
	});

	it('should reject invalid recipient type', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, recipientType: { 0: '__proto__' }, roleName: { 0: 'test' }, routingOrder: { 0: '1' }, additionalFields: { 0: {} } },
		});
		await expect(handleTemplateRecipient(ctx, 'create', 0)).rejects.toThrow('Invalid recipient type');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleTemplateRecipient(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template Recipient Tab
// ==================================================================
describe('handleTemplateRecipientTab', () => {
	const TAB_PARAMS = { ...BASE_PARAMS, recipientId: { 0: 'r1' } };

	it('list — should GET tabs', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: TAB_PARAMS, httpResponses: [{ signHereTabs: [] }] });
		await handleTemplateRecipientTab(ctx, 'list', 0);
	});

	it('create — should POST tabs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...TAB_PARAMS, tabType: { 0: 'signHereTabs' }, tabs: { 0: { tab: [{ documentId: '1', pageNumber: '1', placementMethod: 'anchor', anchorString: '/sign/' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateRecipientTab(ctx, 'create', 0);
	});

	it('update — should PUT tabs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...TAB_PARAMS, tabType: { 0: 'textTabs' }, tabs: { 0: { tab: [{ documentId: '1', pageNumber: '1', placementMethod: 'fixed', xPosition: '100', yPosition: '200', tabId: 't1' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateRecipientTab(ctx, 'update', 0);
	});

	it('delete — should DELETE tabs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...TAB_PARAMS, tabType: { 0: 'signHereTabs' }, tabIds: { 0: 'tab-1, tab-2' } },
			httpResponses: [{}],
		});
		await handleTemplateRecipientTab(ctx, 'delete', 0);
	});

	it('create — should handle advanced tab properties', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...TAB_PARAMS,
				tabType: { 0: 'textTabs' },
				tabs: { 0: { tab: [{
					documentId: '1', pageNumber: '1', placementMethod: 'anchor',
					anchorString: '/text/', anchorHorizontalAlignment: 'right',
					tabGroupLabels: 'grp1, grp2', customTabId: 'ct-1', recipientId: 'r2',
				}] } },
			},
			httpResponses: [{}],
		});
		await handleTemplateRecipientTab(ctx, 'create', 0);
	});

	it('should reject invalid tab type', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...TAB_PARAMS, tabType: { 0: 'constructor' }, tabs: { 0: { tab: [] } } },
		});
		await expect(handleTemplateRecipientTab(ctx, 'create', 0)).rejects.toThrow('Invalid tab type');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: TAB_PARAMS });
		await expect(handleTemplateRecipientTab(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template Custom Field
// ==================================================================
describe('handleTemplateCustomField', () => {
	it('list — should GET custom fields', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS, httpResponses: [{ textCustomFields: [] }] });
		await handleTemplateCustomField(ctx, 'list', 0);
	});

	it('create — should POST custom fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, textCustomFields: { 0: { field: [{ name: 'PO', value: '123' }] } }, listCustomFields: { 0: {} } },
			httpResponses: [{}],
		});
		await handleTemplateCustomField(ctx, 'create', 0);
	});

	it('delete — should DELETE custom field', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, customFieldId: { 0: 'f1' } },
			httpResponses: [{}],
		});
		await handleTemplateCustomField(ctx, 'delete', 0);
	});

	it('update — should PUT custom fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, textCustomFields: { 0: { field: [{ fieldId: 'f1', name: 'PO', value: 'updated' }] } }, listCustomFields: { 0: { field: [{ fieldId: 'f2', name: 'Dept', listItems: 'A;B', value: 'A' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateCustomField(ctx, 'update', 0);
	});

	it('should reject invalid field ID on delete', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: { ...BASE_PARAMS, customFieldId: { 0: '../bad' } } });
		await expect(handleTemplateCustomField(ctx, 'delete', 0)).rejects.toThrow('contains invalid characters');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleTemplateCustomField(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template Document Field
// ==================================================================
describe('handleTemplateDocumentField', () => {
	const DOC_PARAMS = { ...BASE_PARAMS, documentId: { 0: '1' } };

	it('list — should GET document fields', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: DOC_PARAMS, httpResponses: [{ documentFields: [] }] });
		await handleTemplateDocumentField(ctx, 'list', 0);
	});

	it('create — should POST fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, documentFields: { 0: { field: [{ name: 'key', value: 'val' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentField(ctx, 'create', 0);
	});

	it('update — should PUT fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, documentFields: { 0: { field: [{ name: 'key', value: 'updated' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentField(ctx, 'update', 0);
	});

	it('delete — should DELETE fields', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, documentFields: { 0: { field: [{ name: 'key', value: '' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentField(ctx, 'delete', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: DOC_PARAMS });
		await expect(handleTemplateDocumentField(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template Document Tab
// ==================================================================
describe('handleTemplateDocumentTab', () => {
	const DOC_PARAMS = { ...BASE_PARAMS, documentId: { 0: '1' } };

	it('get — should GET tabs', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: DOC_PARAMS, httpResponses: [{}] });
		await handleTemplateDocumentTab(ctx, 'get', 0);
	});

	it('getByPage — should GET tabs by page', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, pageNumber: { 0: '2' } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentTab(ctx, 'getByPage', 0);
	});

	it('create — should POST tabs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, requestBody: { 0: { signHereTabs: [] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentTab(ctx, 'create', 0);
	});

	it('update — should PUT tabs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, requestBody: { 0: { textTabs: [{ tabId: 't1', value: 'new' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentTab(ctx, 'update', 0);
	});

	it('delete — should DELETE tabs', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...DOC_PARAMS, requestBody: { 0: { signHereTabs: [{ tabId: 't1' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentTab(ctx, 'delete', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: DOC_PARAMS });
		await expect(handleTemplateDocumentTab(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template Document Visibility
// ==================================================================
describe('handleTemplateDocumentVisibility', () => {
	it('get — should GET visibility', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, recipientId: { 0: 'r1' } },
			httpResponses: [{ documentVisibility: [] }],
		});
		await handleTemplateDocumentVisibility(ctx, 'get', 0);
	});

	it('update — should PUT visibility', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, recipientId: { 0: 'r1' }, documentVisibility: { 0: '[{"documentId":"1","visible":"true"}]' } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentVisibility(ctx, 'update', 0);
	});

	it('updateList — should PUT visibility for all', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentVisibility: { 0: '[{"documentId":"1","visible":"false"}]' } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentVisibility(ctx, 'updateList', 0);
	});

	it('update — should reject invalid JSON', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, recipientId: { 0: 'r1' }, documentVisibility: { 0: 'bad' } },
		});
		await expect(handleTemplateDocumentVisibility(ctx, 'update', 0)).rejects.toThrow('valid JSON');
	});

	it('updateList — should reject invalid JSON', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentVisibility: { 0: 'bad json' } },
		});
		await expect(handleTemplateDocumentVisibility(ctx, 'updateList', 0)).rejects.toThrow('valid JSON');
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleTemplateDocumentVisibility(ctx, 'reset', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template Lock
// ==================================================================
describe('handleTemplateLock', () => {
	it('get — should GET lock', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS, httpResponses: [{ lockToken: 'abc' }] });
		await handleTemplateLock(ctx, 'get', 0);
	});

	it('create — should POST lock with lockedByApp', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, lockDurationInSeconds: { 0: 600 }, lockType: { 0: 'edit' }, lockedByApp: { 0: 'n8n' }, useScratchPad: { 0: 'false' }, templatePassword: { 0: '' } },
			httpResponses: [{ lockToken: 'new-token' }],
		});
		await handleTemplateLock(ctx, 'create', 0);
	});

	it('update — should PUT lock', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, lockDurationInSeconds: { 0: 900 }, lockToken: { 0: 'token' } },
			httpResponses: [{}],
		});
		await handleTemplateLock(ctx, 'update', 0);
	});

	it('delete — should DELETE lock', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, lockToken: { 0: 'token' } },
			httpResponses: [{}],
		});
		await handleTemplateLock(ctx, 'delete', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleTemplateLock(ctx, 'refresh', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template View
// ==================================================================
describe('handleTemplateView', () => {
	it('createEdit — should generate edit URL', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, returnUrl: { 0: 'https://example.com/done' }, viewAccess: { 0: 'template' }, viewSettings: { 0: {} } },
			httpResponses: [{ url: 'https://demo.docusign.net/edit/...' }],
		});
		const result = await handleTemplateView(ctx, 'createEdit', 0) as { url: string };
		expect(result.url).toContain('docusign');
	});

	it('createEdit — should pass advanced view settings', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: {
				...BASE_PARAMS,
				returnUrl: { 0: 'https://example.com/done' },
				viewAccess: { 0: '' },
				viewSettings: { 0: { showBackButton: 'true', startingScreen: 'tagger', lockToken: 'lock-123', showAdvancedOptions: 'true' } },
			},
			httpResponses: [{ url: 'https://demo.docusign.net/edit/...' }],
		});
		await handleTemplateView(ctx, 'createEdit', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleTemplateView(ctx, 'createSender', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Template HTML Definition
// ==================================================================
describe('handleTemplateHtmlDefinition', () => {
	it('list — should GET HTML definitions', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS, httpResponses: [{ htmlDefinitions: [] }] });
		await handleTemplateHtmlDefinition(ctx, 'list', 0);
	});

	it('listDocument — should GET document HTML definitions', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' } },
			httpResponses: [{ htmlDefinitions: [] }],
		});
		await handleTemplateHtmlDefinition(ctx, 'listDocument', 0);
	});

	it('createResponsiveHtml — should POST responsive preview', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, requestBody: { 0: {} } },
			httpResponses: [{ htmlDefinitions: [] }],
		});
		await handleTemplateHtmlDefinition(ctx, 'createResponsiveHtml', 0);
	});

	it('createDocResponsiveHtml — should POST doc responsive preview', async () => {
		const ctx = createMockContext({
			credentials: BASE_CREDS,
			parameters: { ...BASE_PARAMS, documentId: { 0: '1' }, requestBody: { 0: {} } },
			httpResponses: [{}],
		});
		await handleTemplateHtmlDefinition(ctx, 'createDocResponsiveHtml', 0);
	});

	it('should throw on unsupported operation', async () => {
		const ctx = createMockContext({ credentials: BASE_CREDS, parameters: BASE_PARAMS });
		await expect(handleTemplateHtmlDefinition(ctx, 'purge', 0)).rejects.toThrow('Unsupported');
	});
});
