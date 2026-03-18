import { describe, it, expect } from '@jest/globals';
import { createMockContext } from './helpers/mockContext';
import { handleConnectConfiguration } from '../nodes/DocuSign/resources/connectConfiguration/connectConfiguration.handler';
import { handlePowerForm } from '../nodes/DocuSign/resources/powerForm/powerForm.handler';
import { handlePowerFormData } from '../nodes/DocuSign/resources/powerFormData/powerFormData.handler';
import { handleFolder } from '../nodes/DocuSign/resources/folder/folder.handler';
import { handleWorkspace } from '../nodes/DocuSign/resources/workspace/workspace.handler';
import { handleWorkspaceItem } from '../nodes/DocuSign/resources/workspaceItem/workspaceItem.handler';

const C = { docuSignOAuth2Api: { environment: 'demo' } };
const P = { accountId: { 0: 'acct-1' } };

// ==================================================================
// Connect Configuration
// ==================================================================
describe('handleConnectConfiguration', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, connectId: { 0: 'c1' } }, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'get', 0); });
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"urlToPublishTo":"https://x.com/hook","name":"n8n"}' } }, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'create', 0); });
	it('create — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleConnectConfiguration(ctx, 'create', 0)).rejects.toThrow(); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, connectId: { 0: 'c1' }, requestBody: { 0: '{"name":"updated"}' } }, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'update', 0); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, connectId: { 0: 'c1' } }, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'delete', 0); });
	it('getEventLog', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, filters: { 0: { fromDate: '2024-01-01', toDate: '2024-12-31', status: 'failed' } } }, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'getEventLog', 0); });
	it('getEventLog — no filters', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, filters: { 0: {} } }, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'getEventLog', 0); });
	it('getEventFailures', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'getEventFailures', 0); });
	it('deleteEventLog', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, logId: { 0: 'log-1' } }, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'deleteEventLog', 0); });
	it('retryEventForEnvelope', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, envelopeId: { 0: 'env-1' } }, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'retryEventForEnvelope', 0); });
	it('publishToConnect', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"envelopeIds":["e1"]}' } }, httpResponses: [{}] }); await handleConnectConfiguration(ctx, 'publishToConnect', 0); });
	it('rejects invalid connectId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, connectId: { 0: '../x' } } }); await expect(handleConnectConfiguration(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('rejects invalid logId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, logId: { 0: '../x' } } }); await expect(handleConnectConfiguration(ctx, 'deleteEventLog', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleConnectConfiguration(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

// ==================================================================
// PowerForm
// ==================================================================
describe('handlePowerForm', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handlePowerForm(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, powerFormId: { 0: 'pf-1' } }, httpResponses: [{}] }); await handlePowerForm(ctx, 'get', 0); });
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"name":"PF","templateId":"t1"}' } }, httpResponses: [{}] }); await handlePowerForm(ctx, 'create', 0); });
	it('create — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handlePowerForm(ctx, 'create', 0)).rejects.toThrow(); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, powerFormId: { 0: 'pf-1' }, requestBody: { 0: '{"name":"Updated"}' } }, httpResponses: [{}] }); await handlePowerForm(ctx, 'update', 0); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, powerFormId: { 0: 'pf-1' } }, httpResponses: [{}] }); await handlePowerForm(ctx, 'delete', 0); });
	it('deleteList', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, powerFormIds: { 0: 'pf-1, pf-2' } }, httpResponses: [{}] }); await handlePowerForm(ctx, 'deleteList', 0); });
	it('listSenders', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handlePowerForm(ctx, 'listSenders', 0); });
	it('rejects invalid powerFormId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, powerFormId: { 0: '../x' } } }); await expect(handlePowerForm(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handlePowerForm(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

// ==================================================================
// PowerForm Data
// ==================================================================
describe('handlePowerFormData', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, powerFormId: { 0: 'pf-1' }, filters: { 0: { fromDate: '2024-01-01', toDate: '2024-12-31', dataLayout: 'combined' } } }, httpResponses: [{}] }); await handlePowerFormData(ctx, 'list', 0); });
	it('list — no filters', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, powerFormId: { 0: 'pf-1' }, filters: { 0: {} } }, httpResponses: [{}] }); await handlePowerFormData(ctx, 'list', 0); });
	it('rejects invalid powerFormId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, powerFormId: { 0: '../x' }, filters: { 0: {} } } }); await expect(handlePowerFormData(ctx, 'list', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, powerFormId: { 0: 'pf-1' } } }); await expect(handlePowerFormData(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

// ==================================================================
// Folder
// ==================================================================
describe('handleFolder', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleFolder(ctx, 'list', 0); });
	it('listItems', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, folderId: { 0: 'f1' }, filters: { 0: { status: 'completed', fromDate: '2024-01-01', searchText: 'invoice' } } }, httpResponses: [{}] }); await handleFolder(ctx, 'listItems', 0); });
	it('listItems — no filters', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, folderId: { 0: 'f1' }, filters: { 0: {} } }, httpResponses: [{}] }); await handleFolder(ctx, 'listItems', 0); });
	it('moveEnvelopes', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, folderId: { 0: 'f1' }, envelopeIds: { 0: 'e1, e2' }, fromFolderId: { 0: 'f0' } }, httpResponses: [{}] }); await handleFolder(ctx, 'moveEnvelopes', 0); });
	it('moveEnvelopes — single envelope', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, folderId: { 0: 'f1' }, envelopeIds: { 0: 'e1' }, fromFolderId: { 0: 'f0' } }, httpResponses: [{}] }); await handleFolder(ctx, 'moveEnvelopes', 0); });
	it('search', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, searchFolderId: { 0: 'sf1' }, searchFilters: { 0: { searchText: 'contract', includeRecipients: 'true', order: 'desc', orderBy: 'created' } } }, httpResponses: [{}] }); await handleFolder(ctx, 'search', 0); });
	it('search — no filters', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, searchFolderId: { 0: 'sf1' }, searchFilters: { 0: {} } }, httpResponses: [{}] }); await handleFolder(ctx, 'search', 0); });
	it('rejects invalid folderId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, folderId: { 0: '../x' }, filters: { 0: {} } } }); await expect(handleFolder(ctx, 'listItems', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleFolder(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

// ==================================================================
// Workspace
// ==================================================================
describe('handleWorkspace', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleWorkspace(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, workspaceId: { 0: 'ws-1' } }, httpResponses: [{}] }); await handleWorkspace(ctx, 'get', 0); });
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, workspaceName: { 0: 'My WS' }, workspaceDescription: { 0: 'desc' } }, httpResponses: [{}] }); await handleWorkspace(ctx, 'create', 0); });
	it('create — minimal', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, workspaceName: { 0: 'Min' }, workspaceDescription: { 0: '' } }, httpResponses: [{}] }); await handleWorkspace(ctx, 'create', 0); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, workspaceId: { 0: 'ws-1' }, requestBody: { 0: '{"workspaceName":"Updated"}' } }, httpResponses: [{}] }); await handleWorkspace(ctx, 'update', 0); });
	it('update — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, workspaceId: { 0: 'ws-1' }, requestBody: { 0: 'bad' } } }); await expect(handleWorkspace(ctx, 'update', 0)).rejects.toThrow(); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, workspaceId: { 0: 'ws-1' } }, httpResponses: [{}] }); await handleWorkspace(ctx, 'delete', 0); });
	it('rejects invalid workspaceId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, workspaceId: { 0: '../x' } } }); await expect(handleWorkspace(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleWorkspace(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

// ==================================================================
// Workspace Item
// ==================================================================
describe('handleWorkspaceItem', () => {
	const WP = { ...P, workspaceId: { 0: 'ws-1' }, folderId: { 0: 'fold-1' } };

	it('listFolderItems', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...WP, filters: { 0: { type: 'file' } } }, httpResponses: [{}] }); await handleWorkspaceItem(ctx, 'listFolderItems', 0); });
	it('listFolderItems — no filters', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...WP, filters: { 0: {} } }, httpResponses: [{}] }); await handleWorkspaceItem(ctx, 'listFolderItems', 0); });
	it('getFile — binary download', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...WP, fileId: { 0: 'file-1' }, binaryPropertyName: { 0: 'doc' } }, httpResponses: [Buffer.from('PDF')] });
		const r = await handleWorkspaceItem(ctx, 'getFile', 0) as { binary: Record<string, unknown> }; expect(r.binary.doc).toBeDefined();
	});
	it('createFile — binary upload', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...WP, uploadSource: { 0: 'binary' }, inputBinaryPropertyName: { 0: 'data' } }, binaryData: { 0: { data: { data: 'AA==', mimeType: 'application/pdf', fileName: 'test.pdf', fileSize: '10' } } }, httpResponses: [{}] });
		await handleWorkspaceItem(ctx, 'createFile', 0);
	});
	it('createFile — base64 upload', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...WP, uploadSource: { 0: 'base64' }, base64Content: { 0: 'AA==' } }, httpResponses: [{}] });
		await handleWorkspaceItem(ctx, 'createFile', 0);
	});
	it('updateFile — base64', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...WP, fileId: { 0: 'file-1' }, uploadSource: { 0: 'base64' }, base64Content: { 0: 'AA==' } }, httpResponses: [{}] });
		await handleWorkspaceItem(ctx, 'updateFile', 0);
	});
	it('listFilePages', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...WP, fileId: { 0: 'file-1' }, pageFilters: { 0: {} } }, httpResponses: [{}] }); await handleWorkspaceItem(ctx, 'listFilePages', 0); });
	it('listFilePages — with filters', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...WP, fileId: { 0: 'file-1' }, pageFilters: { 0: { count: '10', startPosition: '0' } } }, httpResponses: [{}] }); await handleWorkspaceItem(ctx, 'listFilePages', 0); });
	it('deleteFolderItems', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...WP, itemsJson: { 0: '[{"itemId":"i1","itemType":"file"}]' } }, httpResponses: [{}] }); await handleWorkspaceItem(ctx, 'deleteFolderItems', 0); });
	it('deleteFolderItems — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...WP, itemsJson: { 0: 'bad' } } }); await expect(handleWorkspaceItem(ctx, 'deleteFolderItems', 0)).rejects.toThrow(); });
	it('rejects invalid fileId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...WP, fileId: { 0: '../x' }, binaryPropertyName: { 0: 'd' } } }); await expect(handleWorkspaceItem(ctx, 'getFile', 0)).rejects.toThrow('contains invalid characters'); });
	it('rejects invalid workspaceId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, workspaceId: { 0: '../x' }, folderId: { 0: 'f1' } } }); await expect(handleWorkspaceItem(ctx, 'listFolderItems', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: WP }); await expect(handleWorkspaceItem(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});
