import { describe, it, expect } from '@jest/globals';
import { createMockContext } from './helpers/mockContext';
import { handleRequestLog } from '../nodes/DocuSign/resources/requestLog/requestLog.handler';
import { handleDiagnosticResource } from '../nodes/DocuSign/resources/diagnosticResource/diagnosticResource.handler';
import { handleDiagnosticService } from '../nodes/DocuSign/resources/diagnosticService/diagnosticService.handler';
import { handleBccEmailArchive } from '../nodes/DocuSign/resources/bccEmailArchive/bccEmailArchive.handler';
import { handleNotary } from '../nodes/DocuSign/resources/notary/notary.handler';
import { handleNotaryJurisdiction } from '../nodes/DocuSign/resources/notaryJurisdiction/notaryJurisdiction.handler';
import { handleNotaryJournal } from '../nodes/DocuSign/resources/notaryJournal/notaryJournal.handler';

const C = { docuSignOAuth2Api: { environment: 'demo' } };
const P = { accountId: { 0: 'acct-1' } };

describe('handleRequestLog', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleRequestLog(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestLogId: { 0: 'rl-1' } }, httpResponses: [{}] }); await handleRequestLog(ctx, 'get', 0); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleRequestLog(ctx, 'delete', 0); });
	it('getSettings', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleRequestLog(ctx, 'getSettings', 0); });
	it('updateSettings', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"apiRequestLogging":"true"}' } }, httpResponses: [{}] }); await handleRequestLog(ctx, 'updateSettings', 0); });
	it('updateSettings — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleRequestLog(ctx, 'updateSettings', 0)).rejects.toThrow(); });
	it('rejects invalid requestLogId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestLogId: { 0: '../x' } } }); await expect(handleRequestLog(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleRequestLog(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleDiagnosticResource', () => {
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleDiagnosticResource(ctx, 'get', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleDiagnosticResource(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleDiagnosticService', () => {
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleDiagnosticService(ctx, 'get', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleDiagnosticService(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleBccEmailArchive', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleBccEmailArchive(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, bccEmailArchiveId: { 0: 'bcc-1' } }, httpResponses: [{}] }); await handleBccEmailArchive(ctx, 'get', 0); });
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"bccEmailAddress":"archive@test.com"}' } }, httpResponses: [{}] }); await handleBccEmailArchive(ctx, 'create', 0); });
	it('create — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleBccEmailArchive(ctx, 'create', 0)).rejects.toThrow(); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, bccEmailArchiveId: { 0: 'bcc-1' } }, httpResponses: [{}] }); await handleBccEmailArchive(ctx, 'delete', 0); });
	it('rejects invalid bccEmailArchiveId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, bccEmailArchiveId: { 0: '../x' } } }); await expect(handleBccEmailArchive(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleBccEmailArchive(ctx, 'update', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleNotary', () => {
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleNotary(ctx, 'get', 0); });
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"name":"Notary"}' } }, httpResponses: [{}] }); await handleNotary(ctx, 'create', 0); });
	it('create — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleNotary(ctx, 'create', 0)).rejects.toThrow(); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{}' } }, httpResponses: [{}] }); await handleNotary(ctx, 'update', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleNotary(ctx, 'delete', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleNotaryJurisdiction', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleNotaryJurisdiction(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, jurisdictionId: { 0: 'jur-1' } }, httpResponses: [{}] }); await handleNotaryJurisdiction(ctx, 'get', 0); });
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"jurisdictionName":"CA"}' } }, httpResponses: [{}] }); await handleNotaryJurisdiction(ctx, 'create', 0); });
	it('create — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleNotaryJurisdiction(ctx, 'create', 0)).rejects.toThrow(); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, jurisdictionId: { 0: 'jur-1' }, requestBody: { 0: '{}' } }, httpResponses: [{}] }); await handleNotaryJurisdiction(ctx, 'update', 0); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, jurisdictionId: { 0: 'jur-1' } }, httpResponses: [{}] }); await handleNotaryJurisdiction(ctx, 'delete', 0); });
	it('rejects invalid jurisdictionId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, jurisdictionId: { 0: '../x' } } }); await expect(handleNotaryJurisdiction(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleNotaryJurisdiction(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleNotaryJournal', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, filters: { 0: { searchText: 'test', count: '50' } } }, httpResponses: [{}] }); await handleNotaryJournal(ctx, 'list', 0); });
	it('list — no filters', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, filters: { 0: {} } }, httpResponses: [{}] }); await handleNotaryJournal(ctx, 'list', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleNotaryJournal(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});
