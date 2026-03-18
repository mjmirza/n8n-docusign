import { describe, it, expect } from '@jest/globals';
import { createMockContext } from './helpers/mockContext';
import { handleBillingPlan } from '../nodes/DocuSign/resources/billingPlan/billingPlan.handler';
import { handleInvoice } from '../nodes/DocuSign/resources/invoice/invoice.handler';
import { handlePayment } from '../nodes/DocuSign/resources/payment/payment.handler';
import { handlePaymentGateway } from '../nodes/DocuSign/resources/paymentGateway/paymentGateway.handler';
import { handleBulkEnvelope } from '../nodes/DocuSign/resources/bulkEnvelope/bulkEnvelope.handler';
import { handleChunkedUpload } from '../nodes/DocuSign/resources/chunkedUpload/chunkedUpload.handler';
import { handleCloudStorage } from '../nodes/DocuSign/resources/cloudStorage/cloudStorage.handler';

const C = { docuSignOAuth2Api: { environment: 'demo' } };
const P = { accountId: { 0: 'acct-1' } };

describe('handleBillingPlan', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleBillingPlan(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, planId: { 0: 'plan-1' } }, httpResponses: [{}] }); await handleBillingPlan(ctx, 'get', 0); });
	it('getAccountPlan', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleBillingPlan(ctx, 'getAccountPlan', 0); });
	it('getCreditCard', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleBillingPlan(ctx, 'getCreditCard', 0); });
	it('getDowngradeRequestBillingInfo', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleBillingPlan(ctx, 'getDowngradeRequestBillingInfo', 0); });
	it('purchaseEnvelopes', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"amount":"100","quantity":"50"}' } }, httpResponses: [{}] }); await handleBillingPlan(ctx, 'purchaseEnvelopes', 0); });
	it('purchaseEnvelopes — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleBillingPlan(ctx, 'purchaseEnvelopes', 0)).rejects.toThrow(); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, updateBody: { 0: '{}' } }, httpResponses: [{}] }); await handleBillingPlan(ctx, 'update', 0); });
	it('update — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, updateBody: { 0: 'bad' } } }); await expect(handleBillingPlan(ctx, 'update', 0)).rejects.toThrow(); });
	it('updateDowngrade', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, downgradeBody: { 0: '{}' } }, httpResponses: [{}] }); await handleBillingPlan(ctx, 'updateDowngrade', 0); });
	it('rejects invalid planId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, planId: { 0: '../x' } } }); await expect(handleBillingPlan(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleBillingPlan(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleInvoice', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, filters: { 0: { fromDate: '2024-01-01', toDate: '2024-12-31' } } }, httpResponses: [{}] }); await handleInvoice(ctx, 'list', 0); });
	it('list — no filters', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, filters: { 0: {} } }, httpResponses: [{}] }); await handleInvoice(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, invoiceId: { 0: 'inv-1' } }, httpResponses: [{}] }); await handleInvoice(ctx, 'get', 0); });
	it('rejects invalid invoiceId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, invoiceId: { 0: '../x' } } }); await expect(handleInvoice(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleInvoice(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handlePayment', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, filters: { 0: { fromDate: '2024-01-01', toDate: '2024-12-31' } } }, httpResponses: [{}] }); await handlePayment(ctx, 'list', 0); });
	it('list — no filters', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, filters: { 0: {} } }, httpResponses: [{}] }); await handlePayment(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, paymentId: { 0: 'pay-1' } }, httpResponses: [{}] }); await handlePayment(ctx, 'get', 0); });
	it('rejects invalid paymentId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, paymentId: { 0: '../x' } } }); await expect(handlePayment(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handlePayment(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handlePaymentGateway', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handlePaymentGateway(ctx, 'list', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handlePaymentGateway(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleBulkEnvelope', () => {
	it('listBulkSendLists', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleBulkEnvelope(ctx, 'listBulkSendLists', 0); });
	it('getBulkSendList', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, bulkSendListId: { 0: 'bsl-1' } }, httpResponses: [{}] }); await handleBulkEnvelope(ctx, 'getBulkSendList', 0); });
	it('createBulkSendList', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"name":"Bulk List","bulkCopies":[]}' } }, httpResponses: [{}] }); await handleBulkEnvelope(ctx, 'createBulkSendList', 0); });
	it('createBulkSendList — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleBulkEnvelope(ctx, 'createBulkSendList', 0)).rejects.toThrow(); });
	it('updateBulkSendList', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, bulkSendListId: { 0: 'bsl-1' }, updateBody: { 0: '{"name":"Updated"}' } }, httpResponses: [{}] }); await handleBulkEnvelope(ctx, 'updateBulkSendList', 0); });
	it('deleteBulkSendList', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, bulkSendListId: { 0: 'bsl-1' } }, httpResponses: [{}] }); await handleBulkEnvelope(ctx, 'deleteBulkSendList', 0); });
	it('sendBulk', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, bulkSendListId: { 0: 'bsl-1' }, envelopeOrTemplateId: { 0: 'env-1' } }, httpResponses: [{}] }); await handleBulkEnvelope(ctx, 'sendBulk', 0); });
	it('rejects invalid bulkSendListId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, bulkSendListId: { 0: '../x' } } }); await expect(handleBulkEnvelope(ctx, 'getBulkSendList', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleBulkEnvelope(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleChunkedUpload', () => {
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{}' } }, httpResponses: [{}] }); await handleChunkedUpload(ctx, 'create', 0); });
	it('create — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleChunkedUpload(ctx, 'create', 0)).rejects.toThrow(); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, chunkedUploadId: { 0: 'cu-1' } }, httpResponses: [{}] }); await handleChunkedUpload(ctx, 'get', 0); });
	it('update — base64', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, chunkedUploadId: { 0: 'cu-1' }, chunkIndex: { 0: 1 }, inputDataSource: { 0: 'base64' }, base64Data: { 0: 'AA==' } }, httpResponses: [{}] }); await handleChunkedUpload(ctx, 'update', 0); });
	it('update — binary', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, chunkedUploadId: { 0: 'cu-1' }, chunkIndex: { 0: 2 }, inputDataSource: { 0: 'binaryProperty' }, binaryPropertyName: { 0: 'data' } }, binaryData: { 0: { data: { data: 'AA==', mimeType: 'application/octet-stream', fileName: 'chunk', fileSize: '10' } } }, httpResponses: [{}] });
		await handleChunkedUpload(ctx, 'update', 0);
	});
	it('commit', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, chunkedUploadId: { 0: 'cu-1' } }, httpResponses: [{}] }); await handleChunkedUpload(ctx, 'commit', 0); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, chunkedUploadId: { 0: 'cu-1' } }, httpResponses: [{}] }); await handleChunkedUpload(ctx, 'delete', 0); });
	it('rejects invalid chunkedUploadId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, chunkedUploadId: { 0: '../x' } } }); await expect(handleChunkedUpload(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleChunkedUpload(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleCloudStorage', () => {
	const CP = { ...P, userId: { 0: 'u1' } };
	it('listProviders', async () => { const ctx = createMockContext({ credentials: C, parameters: CP, httpResponses: [{}] }); await handleCloudStorage(ctx, 'listProviders', 0); });
	it('listFolders', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...CP, serviceId: { 0: 'svc-1' } }, httpResponses: [{}] }); await handleCloudStorage(ctx, 'listFolders', 0); });
	it('listFiles', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...CP, serviceId: { 0: 'svc-1' }, folderId: { 0: 'fold-1' } }, httpResponses: [{}] }); await handleCloudStorage(ctx, 'listFiles', 0); });
	it('getFile — binary', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...CP, serviceId: { 0: 'svc-1' }, folderId: { 0: 'fold-1' }, fileId: { 0: 'file-1' }, binaryPropertyName: { 0: 'doc' } }, httpResponses: [Buffer.from('data')] });
		const r = await handleCloudStorage(ctx, 'getFile', 0) as { binary: Record<string, unknown> }; expect(r.binary.doc).toBeDefined();
	});
	it('rejects invalid serviceId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...CP, serviceId: { 0: '../x' } } }); await expect(handleCloudStorage(ctx, 'listFolders', 0)).rejects.toThrow('contains invalid characters'); });
	it('rejects invalid fileId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...CP, serviceId: { 0: 's1' }, folderId: { 0: 'f1' }, fileId: { 0: '../x' }, binaryPropertyName: { 0: 'd' } } }); await expect(handleCloudStorage(ctx, 'getFile', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: CP }); await expect(handleCloudStorage(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});
