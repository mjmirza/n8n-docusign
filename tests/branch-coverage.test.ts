/**
 * BRANCH COVERAGE COMPLETION
 *
 * Tests specifically designed to hit every uncovered branch path.
 * Each test targets specific uncovered lines identified by jest coverage.
 */
import { describe, it, expect } from '@jest/globals';
import { createMockContext, allowOffSpecRequests } from './helpers/mockContext';

import { handleEnvelopeAttachment } from '../nodes/DocuSign/resources/envelopeAttachment/envelopeAttachment.handler';
import { handleEnvelopeCustomField } from '../nodes/DocuSign/resources/envelopeCustomField/envelopeCustomField.handler';
import { handleEnvelopeDocumentField } from '../nodes/DocuSign/resources/envelopeDocumentField/envelopeDocumentField.handler';
import { handleEnvelopeRecipientTab } from '../nodes/DocuSign/resources/envelopeRecipientTab/envelopeRecipientTab.handler';
import { handleTemplate } from '../nodes/DocuSign/resources/template/template.handler';
import { handleTemplateCustomField } from '../nodes/DocuSign/resources/templateCustomField/templateCustomField.handler';
import { handleTemplateDocument } from '../nodes/DocuSign/resources/templateDocument/templateDocument.handler';
import { handleTemplateDocumentField } from '../nodes/DocuSign/resources/templateDocumentField/templateDocumentField.handler';
import { handleTemplateLock } from '../nodes/DocuSign/resources/templateLock/templateLock.handler';
import { handleTemplateRecipient } from '../nodes/DocuSign/resources/templateRecipient/templateRecipient.handler';
import { handleTemplateRecipientTab } from '../nodes/DocuSign/resources/templateRecipientTab/templateRecipientTab.handler';
import { handleUser } from '../nodes/DocuSign/resources/user/user.handler';
import { handleUserContact } from '../nodes/DocuSign/resources/userContact/userContact.handler';
import { handleUserProfile } from '../nodes/DocuSign/resources/userProfile/userProfile.handler';

const C = { docuSignOAuth2Api: { environment: 'demo' } };
const P = { accountId: { 0: 'acct-1' } };

// ==================================================================
// envelopeAttachment: lines 52-53 (remoteUrl branch, label absent)
// ==================================================================
describe('Branch: envelopeAttachment', () => {
	it('create — without label/remoteUrl (false branches)', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, envelopeId: { 0: 'e1' },
				attachmentName: { 0: 'test' }, attachmentType: { 0: '.pdf' },
				source: { 0: 'base64' }, base64Content: { 0: 'SGVsbG8=' },
				accessControl: { 0: 'senderOnly' }, label: { 0: '' }, remoteUrl: { 0: '' },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeAttachment(ctx, 'create', 0);
	});
});

// ==================================================================
// envelopeCustomField: lines 53, 64-67 (listItems absent, fieldId absent)
// ==================================================================
describe('Branch: envelopeCustomField', () => {
	it('create — text field without fieldId, list field without listItems', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, envelopeId: { 0: 'e1' },
				textCustomFields: { 0: { field: [{ name: 'F1', value: '' }] } },
				listCustomFields: { 0: { field: [{ name: 'L1' }] } },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeCustomField(ctx, 'create', 0);
	});
});

// ==================================================================
// envelopeDocumentField: line 45 (field value absent)
// ==================================================================
describe('Branch: envelopeDocumentField', () => {
	it('create — field without value', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, envelopeId: { 0: 'e1' }, documentId: { 0: '1' },
				documentFields: { 0: { field: [{ name: 'key' }] } },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeDocumentField(ctx, 'create', 0);
	});
});

// ==================================================================
// envelopeRecipientTab: lines 80-136 (all the optional tab property false branches)
// ==================================================================
describe('Branch: envelopeRecipientTab', () => {
	it('create — tab with NO optional properties (all false branches)', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, envelopeId: { 0: 'e1' }, recipientId: { 0: 'r1' },
				tabType: { 0: 'signHereTabs' },
				tabs: { 0: { tab: [{
					documentId: '1', pageNumber: '1',
					placementMethod: 'fixed',
					// All optional fields absent or default
					tabLabel: '', value: '', required: 'false', locked: 'false',
					optional: 'false', shared: 'false', senderRequired: 'false',
					concealValueOnDocument: 'false', disableAutoSize: 'false',
					fontSize: 'size12', bold: 'false', italic: 'false', underline: 'false',
					font: 'default', fontColor: '',
					width: 0, height: 0, maxLength: 0,
					validationPattern: '', validationMessage: '', tooltip: '',
					tabOrder: '', name: '',
					conditionalParentLabel: '', conditionalParentValue: '',
					anchorIgnoreIfNotPresent: 'false', anchorCaseSensitive: 'false',
					anchorMatchWholeWord: 'false', anchorHorizontalAlignment: 'left',
					customTabId: '', recipientId: '', tabGroupLabels: '', tabId: '',
				}] } },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeRecipientTab(ctx, 'create', 0);
	});

	it('create — tab with ALL optional properties set (all true branches)', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, envelopeId: { 0: 'e1' }, recipientId: { 0: 'r1' },
				tabType: { 0: 'textTabs' },
				tabs: { 0: { tab: [{
					documentId: '1', pageNumber: '1',
					placementMethod: 'anchor', anchorString: '/field/',
					anchorXOffset: '10', anchorYOffset: '5', anchorUnits: 'pixels',
					tabLabel: 'myLabel', value: 'myValue',
					required: 'true', locked: 'true', optional: 'true',
					shared: 'true', senderRequired: 'true',
					concealValueOnDocument: 'true', disableAutoSize: 'true',
					fontSize: 'size14', bold: 'true', italic: 'true', underline: 'true',
					font: 'arial', fontColor: '#FF0000',
					width: 200, height: 30, maxLength: 50,
					validationPattern: '^[0-9]+$', validationMessage: 'Numbers only',
					tooltip: 'Enter a number', tabOrder: '1', name: 'numField',
					conditionalParentLabel: 'parentTab', conditionalParentValue: 'yes',
					anchorIgnoreIfNotPresent: 'true', anchorCaseSensitive: 'true',
					anchorMatchWholeWord: 'true', anchorHorizontalAlignment: 'right',
					customTabId: 'ct-1', recipientId: 'r2', tabGroupLabels: 'grp1,grp2',
					tabId: 'tab-existing',
				}] } },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeRecipientTab(ctx, 'create', 0);
	});
});

// ==================================================================
// templateRecipientTab: same pattern — mirror envelope tab branches
// ==================================================================
describe('Branch: templateRecipientTab', () => {
	it('create — tab with NO optional properties', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, templateId: { 0: 't1' }, recipientId: { 0: 'r1' },
				tabType: { 0: 'signHereTabs' },
				tabs: { 0: { tab: [{
					documentId: '1', pageNumber: '1', placementMethod: 'fixed',
					tabLabel: '', value: '', required: 'false', locked: 'false',
					optional: 'false', shared: 'false', senderRequired: 'false',
					concealValueOnDocument: 'false', disableAutoSize: 'false',
					fontSize: 'size12', bold: 'false', italic: 'false', underline: 'false',
					font: 'default', fontColor: '', width: 0, height: 0, maxLength: 0,
					validationPattern: '', validationMessage: '', tooltip: '',
					tabOrder: '', name: '', conditionalParentLabel: '', conditionalParentValue: '',
					anchorIgnoreIfNotPresent: 'false', anchorCaseSensitive: 'false',
					anchorMatchWholeWord: 'false', anchorHorizontalAlignment: 'left',
					customTabId: '', recipientId: '', tabGroupLabels: '', tabId: '',
				}] } },
			},
			httpResponses: [{}],
		});
		await handleTemplateRecipientTab(ctx, 'create', 0);
	});

	it('create — tab with ALL optional properties', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, templateId: { 0: 't1' }, recipientId: { 0: 'r1' },
				tabType: { 0: 'textTabs' },
				tabs: { 0: { tab: [{
					documentId: '1', pageNumber: '1',
					placementMethod: 'anchor', anchorString: '/field/',
					anchorXOffset: '10', anchorYOffset: '5', anchorUnits: 'pixels',
					tabLabel: 'lab', value: 'val', required: 'true', locked: 'true',
					optional: 'true', shared: 'true', senderRequired: 'true',
					concealValueOnDocument: 'true', disableAutoSize: 'true',
					fontSize: 'size14', bold: 'true', italic: 'true', underline: 'true',
					font: 'arial', fontColor: '#000', width: 100, height: 20, maxLength: 50,
					validationPattern: '.*', validationMessage: 'err', tooltip: 'tip',
					tabOrder: '1', name: 'n', conditionalParentLabel: 'p', conditionalParentValue: 'v',
					anchorIgnoreIfNotPresent: 'true', anchorCaseSensitive: 'true',
					anchorMatchWholeWord: 'true', anchorHorizontalAlignment: 'right',
					customTabId: 'ct1', recipientId: 'r2', tabGroupLabels: 'g1,g2', tabId: 't1',
				}] } },
			},
			httpResponses: [{}],
		});
		await handleTemplateRecipientTab(ctx, 'create', 0);
	});
});

// ==================================================================
// template.handler: all document/recipient false branches
// ==================================================================
describe('Branch: template', () => {
	it('create — doc from binary without fileName', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P,
				templateName: { 0: 'T' }, emailSubject: { 0: 'S' },
				documents: { 0: { document: [{ name: '', documentId: '1', source: 'binary', binaryProperty: 'data', fileExtension: 'pdf', order: 0, transformPdfFields: 'false', includeInDownload: 'true' }] } },
				recipients: { 0: { signer: [{ roleName: 'S', recipientId: '1', routingOrder: '1' }] } },
				additionalFields: { 0: {} },
			},
			binaryData: { 0: { data: { data: 'AA==', mimeType: 'application/pdf', fileName: '', fileSize: '10' } } },
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'create', 0);
	});

	it('create — doc from remoteUrl', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P,
				templateName: { 0: 'T' }, emailSubject: { 0: 'S' },
				documents: { 0: { document: [{ name: 'd', documentId: '1', source: 'remoteUrl', remoteUrl: 'https://x.com/d.pdf', fileExtension: 'pdf', order: 2, transformPdfFields: 'true', includeInDownload: 'false' }] } },
				recipients: { 0: {} },
				additionalFields: { 0: {} },
			},
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'create', 0);
	});

	it('create — recipient with deliveryMethod sms and emailNotification', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P,
				templateName: { 0: 'T' }, emailSubject: { 0: 'S' },
				documents: { 0: { document: [{ name: 'd', documentId: '1', source: 'base64', documentBase64: 'AA==', fileExtension: 'pdf' }] } },
				recipients: { 0: { signer: [{ roleName: 'S', recipientId: '1', routingOrder: '1', email: 'a@b.com', name: 'Test', accessCode: '1234', idCheckConfigurationName: 'ID Check $', deliveryMethod: 'sms', emailNotificationSubject: 'Hi', emailNotificationBody: 'Body' }] } },
				additionalFields: { 0: { carbonCopies: { recipient: [{ roleName: 'CC', email: 'cc@b.com', name: 'CC' }] } } },
			},
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'create', 0);
	});
});

// ==================================================================
// templateCustomField: lines 53, 62-65
// ==================================================================
describe('Branch: templateCustomField', () => {
	it('create — minimal fields (false branches)', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, templateId: { 0: 't1' },
				textCustomFields: { 0: { field: [{ name: 'F' }] } },
				listCustomFields: { 0: { field: [{ name: 'L' }] } },
			},
			httpResponses: [{}],
		});
		await handleTemplateCustomField(ctx, 'create', 0);
	});
});

// ==================================================================
// templateDocument: lines 25-42, 48-49, 55-56 (binary/name/extension branches)
// ==================================================================
describe('Branch: templateDocument', () => {
	it('get — archive type', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, documentId: { 0: 'archive' }, binaryPropertyName: { 0: 'data' } },
			httpResponses: [Buffer.from('ZIP')],
		});
		await handleTemplateDocument(ctx, 'get', 0);
	});

	it('update — binary with fileName fallback', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' }, documentData: { 0: { content: [{ source: 'binary', binaryProperty: 'data', name: '', fileExtension: '' }] } } },
			binaryData: { 0: { data: { data: 'AA==', mimeType: 'application/pdf', fileName: 'fallback.pdf', fileSize: '10' } } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'update', 0);
	});

	it('update — empty content array', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' }, documentData: { 0: {} } },
		});
		await expect(handleTemplateDocument(ctx, 'update', 0)).rejects.toThrow('Document content is required');
	});
});

// ==================================================================
// templateDocument: update with base64 where name IS provided
// ==================================================================
describe('Branch: templateDocument (extra)', () => {
	it('update — base64 with name and fileExtension', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' }, documentData: { 0: { content: [{ source: 'base64', documentBase64: 'AA==', name: 'named.pdf', fileExtension: 'docx' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'update', 0);
	});
});

// ==================================================================
// templateDocumentField: line 45
// ==================================================================
describe('Branch: templateDocumentField', () => {
	it('create — field without value', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' }, documentFields: { 0: { field: [{ name: 'k' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocumentField(ctx, 'create', 0);
	});
});

// ==================================================================
// templateLock: lines 31, 41, 50 (lockToken/templatePassword absent)
// ==================================================================
describe('Branch: templateLock', () => {
	it('create — without templatePassword', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, lockDurationInSeconds: { 0: 300 }, lockType: { 0: 'edit' }, lockedByApp: { 0: 'n8n' }, useScratchPad: { 0: 'false' }, templatePassword: { 0: '' } },
			httpResponses: [{}],
		});
		await handleTemplateLock(ctx, 'create', 0);
	});

	it('create — with templatePassword', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, lockDurationInSeconds: { 0: 300 }, lockType: { 0: 'edit' }, lockedByApp: { 0: 'n8n' }, useScratchPad: { 0: 'true' }, templatePassword: { 0: 'secret' } },
			httpResponses: [{}],
		});
		await handleTemplateLock(ctx, 'create', 0);
	});

	it('update — without lockToken', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, lockDurationInSeconds: { 0: 600 }, lockToken: { 0: '' } },
			httpResponses: [{}],
		});
		await handleTemplateLock(ctx, 'update', 0);
	});

	it('delete — without lockToken', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, lockToken: { 0: '' } },
			httpResponses: [{}],
		});
		await handleTemplateLock(ctx, 'delete', 0);
	});
});

// ==================================================================
// templateRecipient: lines 54-56 (emailNotification absent)
// ==================================================================
describe('Branch: templateRecipient', () => {
	it('create — without email notification', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, templateId: { 0: 't1' },
				recipientType: { 0: 'signers' }, roleName: { 0: 'S' }, routingOrder: { 0: '1' },
				additionalFields: { 0: { email: 'a@b.com', name: 'Test', accessCode: '', deliveryMethod: 'email', note: '' } },
			},
			httpResponses: [{}],
		});
		await handleTemplateRecipient(ctx, 'create', 0);
	});
});

// ==================================================================
// user: lines 20-23 (list with all filters), 48-49 (createFields with all optional)
// ==================================================================
describe('Branch: user', () => {
	it('list — with all filter fields', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, filters: { 0: { status: 'active', email: 'test@test.com', groupId: 'g1', loginStatus: 'login_required' } }, maxResults: { 0: 50 } },
			httpResponses: [{ users: [{ userId: 'u1' }], totalSetSize: '1', resultSetSize: '1' }],
		});
		await handleUser(ctx, 'list', 0);
	});

	it('list — without any filters', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, filters: { 0: {} }, maxResults: { 0: 100 } },
			httpResponses: [{ users: [], totalSetSize: '0', resultSetSize: '0' }],
		});
		await handleUser(ctx, 'list', 0);
	});

	it('create — with all optional createFields', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, email: { 0: 'all@t.com' }, userName: { 0: 'All' }, createFields: { 0: { firstName: 'F', lastName: 'L', middleName: 'M', suffixName: 'Jr', company: 'C', title: 'Mr', jobTitle: 'Dev', groupId: 'g1', sendActivationEmail: 'true', userSettings: '{"key":"val"}', activationAccessCode: 'CODE', password: 'P' } } },
			httpResponses: [{}],
		});
		await handleUser(ctx, 'create', 0);
	});
});

// ==================================================================
// userContact: line 30 (contactId absent in create additionalFields)
// ==================================================================
describe('Branch: userContact', () => {
	it('create — with contactId in additionalFields', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, name: { 0: 'Test' }, additionalFields: { 0: { contactId: 'c-preset' } } },
			httpResponses: [{}],
		});
		await handleUserContact(ctx, 'create', 0);
	});
});

// ==================================================================
// userProfile: line 32 (address fields absent → empty address object)
// ==================================================================
describe('Branch: userProfile', () => {
	it('update — with company but no address fields', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, userId: { 0: 'u1' }, additionalFields: { 0: { company: 'Corp' } } },
			httpResponses: [{}],
		});
		await handleUserProfile(ctx, 'update', 0);
	});
});

// ==================================================================
// transport: lines 132, 164, 201, 324, 329-335, 413-417
// These are error format branches in parseErrorResponse and
// pagination edge cases. Let me add tests.
// ==================================================================
import { docuSignRequest, docuSignGetAll } from '../nodes/DocuSign/transport';
import { createHttpError } from './helpers/mockContext';

// ==================================================================
// envelopeAttachment: lines 52-53 (data is empty when neither binary nor base64)
// ==================================================================
describe('Branch: envelopeAttachment (no data)', () => {
	it('create — base64 source but empty content', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, envelopeId: { 0: 'e1' },
				attachmentName: { 0: 'test' }, attachmentType: { 0: '.pdf' },
				source: { 0: 'base64' }, base64Content: { 0: '' },
				accessControl: { 0: 'senderOnly' }, label: { 0: 'L' }, remoteUrl: { 0: 'https://x.com/f' },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeAttachment(ctx, 'create', 0);
	});
});

// ==================================================================
// envelopeRecipientTab: lines 80-85 — tab with neither anchor nor fixed (no placement set)
// ==================================================================
describe('Branch: envelopeRecipientTab (no placement)', () => {
	it('create — tab without any placement method', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, envelopeId: { 0: 'e1' }, recipientId: { 0: 'r1' },
				tabType: { 0: 'signHereTabs' },
				tabs: { 0: { tab: [{ documentId: '1', pageNumber: '1' }] } },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeRecipientTab(ctx, 'create', 0);
	});
});

// ==================================================================
// templateRecipientTab: lines 80-85 — same pattern
// ==================================================================
describe('Branch: templateRecipientTab (no placement)', () => {
	it('create — tab without placement', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, templateId: { 0: 't1' }, recipientId: { 0: 'r1' },
				tabType: { 0: 'signHereTabs' },
				tabs: { 0: { tab: [{ documentId: '1', pageNumber: '1' }] } },
			},
			httpResponses: [{}],
		});
		await handleTemplateRecipientTab(ctx, 'create', 0);
	});
});

// ==================================================================
// templateLock: lines 41, 50 — update/delete WITH lockToken
// ==================================================================
describe('Branch: templateLock (with tokens)', () => {
	it('update — with lockToken', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, lockDurationInSeconds: { 0: 600 }, lockToken: { 0: 'tok-123' } },
			httpResponses: [{}],
		});
		await handleTemplateLock(ctx, 'update', 0);
	});

	it('delete — with lockToken', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, lockToken: { 0: 'tok-123' } },
			httpResponses: [{}],
		});
		await handleTemplateLock(ctx, 'delete', 0);
	});
});

// ==================================================================
// userProfile: line 32 — address with street2 to ensure it's populated
// ==================================================================
describe('Branch: userProfile (address)', () => {
	it('update — with street2', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, userId: { 0: 'u1' }, additionalFields: { 0: { street1: '123 Main', street2: 'Apt 4', city: 'NYC' } } },
			httpResponses: [{}],
		});
		await handleUserProfile(ctx, 'update', 0);
	});
});

// ==================================================================
// user: lines 20-23 — list with partial filters (some present, some not)
// ==================================================================
describe('Branch: user (partial filters)', () => {
	it('list — with status only', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, filters: { 0: { status: 'active' } }, maxResults: { 0: 10 } },
			httpResponses: [{ users: [], totalSetSize: '0', resultSetSize: '0' }],
		});
		await handleUser(ctx, 'list', 0);
	});

	it('list — with email only', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, filters: { 0: { email: 'x@y.com' } }, maxResults: { 0: 10 } },
			httpResponses: [{ users: [], totalSetSize: '0', resultSetSize: '0' }],
		});
		await handleUser(ctx, 'list', 0);
	});
});

// ==================================================================
// templateDocument: all update path branches
// ==================================================================
describe('Branch: templateDocument (all update paths)', () => {
	it('update — binary source with all fields populated', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' }, documentData: { 0: { content: [{ source: 'binary', binaryProperty: 'data', name: 'explicit.pdf', fileExtension: 'pdf' }] } } },
			binaryData: { 0: { data: { data: 'AA==', mimeType: 'application/pdf', fileName: 'fallback.pdf', fileSize: '10' } } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'update', 0);
	});

	it('update — binary source without name (falls back to fileName)', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' }, documentData: { 0: { content: [{ source: 'binary', binaryProperty: 'data', name: '' }] } } },
			binaryData: { 0: { data: { data: 'AA==', mimeType: 'application/pdf', fileName: 'fb.pdf', fileSize: '10' } } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'update', 0);
	});

	it('update — base64 with name', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' }, documentData: { 0: { content: [{ source: 'base64', documentBase64: 'AA==', name: 'b64.pdf', fileExtension: 'pdf' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'update', 0);
	});

	it('update — base64 without name', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, templateId: { 0: 't1' }, documentId: { 0: '1' }, documentData: { 0: { content: [{ source: 'base64', documentBase64: 'AA==' }] } } },
			httpResponses: [{}],
		});
		await handleTemplateDocument(ctx, 'update', 0);
	});
});

// ==================================================================
// templateRecipient: line 56 — notification body without subject
// ==================================================================
describe('Branch: templateRecipient (notification)', () => {
	it('create — with email notification body only', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, templateId: { 0: 't1' },
				recipientType: { 0: 'signers' }, roleName: { 0: 'S' }, routingOrder: { 0: '1' },
				additionalFields: { 0: { emailNotificationBody: 'Please sign' } },
			},
			httpResponses: [{}],
		});
		await handleTemplateRecipient(ctx, 'create', 0);
	});
});

// ==================================================================
// transport: lines 324, 335 — error without statusCode
// ==================================================================

// ==================================================================
// envelopeRecipientTab: lines 80-85 — placement with missing anchor but method=anchor
// ==================================================================
describe('Branch: envelopeRecipientTab (anchor without anchorString)', () => {
	it('create — anchor placement without anchorString (false path)', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, envelopeId: { 0: 'e1' }, recipientId: { 0: 'r1' },
				tabType: { 0: 'signHereTabs' },
				tabs: { 0: { tab: [{ documentId: '1', pageNumber: '1', placementMethod: 'anchor', anchorString: '' }] } },
			},
			httpResponses: [{}],
		});
		await handleEnvelopeRecipientTab(ctx, 'create', 0);
	});
});

describe('Branch: templateRecipientTab (anchor without anchorString)', () => {
	it('create — anchor placement without anchorString', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P, templateId: { 0: 't1' }, recipientId: { 0: 'r1' },
				tabType: { 0: 'signHereTabs' },
				tabs: { 0: { tab: [{ documentId: '1', pageNumber: '1', placementMethod: 'anchor', anchorString: '' }] } },
			},
			httpResponses: [{}],
		});
		await handleTemplateRecipientTab(ctx, 'create', 0);
	});
});

// ==================================================================
// template.handler create — signer without recipientId/routingOrder (fallback to '1')
// ==================================================================
describe('Branch: template (signer defaults)', () => {
	it('create — signer without recipientId and routingOrder', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P,
				templateName: { 0: 'T' }, emailSubject: { 0: 'S' },
				documents: { 0: { document: [{ name: 'd', documentId: '', source: 'base64', documentBase64: 'AA==', fileExtension: 'pdf' }] } },
				recipients: { 0: { signer: [{ roleName: 'S', recipientId: '', routingOrder: '' }] } },
				additionalFields: { 0: {} },
			},
			httpResponses: [{}],
		});
		await handleTemplate(ctx, 'create', 0);
	});
});

// ==================================================================
// user.handler list — filter with groupId and loginStatus
// ==================================================================
describe('Branch: user (all filter combos)', () => {
	it('list — with groupId and loginStatus only', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, filters: { 0: { groupId: 'g1', loginStatus: 'login_required' } }, maxResults: { 0: 10 } },
			httpResponses: [{ users: [], totalSetSize: '0', resultSetSize: '0' }],
		});
		await handleUser(ctx, 'list', 0);
	});
});

describe('Branch: transport credential resolution', () => {
	it('JWT credentials without environment (defaults to demo)', async () => {
		const ctx = createMockContext({
			credentials: { docuSignJwtApi: {} },
			httpResponses: [{ ok: true }],
		});
		const result = await docuSignRequest(ctx, 'GET', 'accounts/a1');
		expect(result).toEqual({ ok: true });
	});

	it('error without statusCode (statusCode=undefined)', async () => {
		// Fails if the request resolves, so the catch block can never be skipped silently.
		expect.assertions(1);
		const err = new Error('Network error');
		(err as any).body = { message: 'Connection refused' };
		// No statusCode property at all
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [err],
		});
		try {
			await docuSignRequest(ctx, 'GET', 'accounts/a1');
		} catch (e) {
			const thrown = e as { message: string; description?: string };
			expect(thrown.message || thrown.description || '').toContain('unknown');
		}
	});

	it('error with statusCode=0 (falsy)', async () => {
		const err = new Error('Bad') as any;
		err.statusCode = 0;
		err.body = null;
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [err],
		});
		await expect(docuSignRequest(ctx, 'GET', 'accounts/a1')).rejects.toThrow();
	});
});

describe('Branch: transport parseErrorResponse', () => {
	it('error with errorCode but no message', async () => {
		// Fails if the request resolves, so the catch block can never be skipped silently.
		expect.assertions(1);
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [createHttpError(400, { errorCode: 'E001' })],
		});
		try {
			await docuSignRequest(ctx, 'GET', 'accounts/a1');
		} catch (e) {
			// The errorCode-only case: message is undefined, obj.message check fails
			// Falls through to check obj.error
			expect(e).toBeDefined();
		}
	});

	it('error with only error field (no error_description)', async () => {
		// Fails if the request resolves, so the catch block can never be skipped silently.
		expect.assertions(1);
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [createHttpError(400, { error: 'bad_request' })],
		});
		try {
			await docuSignRequest(ctx, 'GET', 'accounts/a1');
		} catch (e) {
			const err = e as { description?: string };
			expect(err.description).toContain('bad_request');
		}
	});

	it('error with title but no detail', async () => {
		// Fails if the request resolves, so the catch block can never be skipped silently.
		expect.assertions(1);
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [createHttpError(400, { title: 'Bad Request' })],
		});
		try {
			await docuSignRequest(ctx, 'GET', 'accounts/a1');
		} catch (e) {
			const err = e as { description?: string };
			expect(err.description).toContain('Bad Request');
		}
	});

	it('error with empty errors array', async () => {
		// Fails if the request resolves, so the catch block can never be skipped silently.
		expect.assertions(1);
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [createHttpError(422, { errors: [] })],
		});
		try {
			await docuSignRequest(ctx, 'GET', 'accounts/a1');
		} catch (e) {
			expect(e).toBeDefined();
		}
	});

	it('error with errors array containing only nulls', async () => {
		// Fails if the request resolves, so the catch block can never be skipped silently.
		expect.assertions(1);
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [createHttpError(422, { errors: [null, undefined] })],
		});
		try {
			await docuSignRequest(ctx, 'GET', 'accounts/a1');
		} catch (e) {
			expect(e).toBeDefined();
		}
	});
});

describe('Branch: transport docuSignGetAll edge cases', () => {
	it('pagination — totalSetSize=0 on first page', async () => {
		allowOffSpecRequests(); // synthetic path, tests transport plumbing only
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [{
				items: [],
				totalSetSize: '0',
				resultSetSize: '0',
			}],
		});
		const result = await docuSignGetAll(ctx, 'GET', 'accounts/a1/items', 'items', {}, 100);
		expect(result).toHaveLength(0);
	});

	it('pagination — missing totalSetSize and resultSetSize (defaults to 0)', async () => {
		allowOffSpecRequests(); // synthetic path, tests transport plumbing only
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [{ items: [{ id: '1' }] }],
		});
		const result = await docuSignGetAll(ctx, 'GET', 'accounts/a1/items', 'items', {}, 100);
		expect(result).toHaveLength(1);
	});

	it('pagination — resultSetSize matches maxResults exactly', async () => {
		allowOffSpecRequests(); // synthetic path, tests transport plumbing only
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [{
				items: [{ id: '1' }, { id: '2' }],
				totalSetSize: '10',
				resultSetSize: '2',
				nextUri: '/next',
			}],
		});
		const result = await docuSignGetAll(ctx, 'GET', 'accounts/a1/items', 'items', {}, 2);
		expect(result).toHaveLength(2);
	});
});
