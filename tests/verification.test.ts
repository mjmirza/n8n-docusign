import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { IDataObject, IHookFunctions } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { DocuSign } from '../nodes/DocuSign/DocuSign.node';
import { DocuSignTrigger } from '../nodes/DocuSign/DocuSignTrigger.node';
import { createMockContext, createHttpError } from './helpers/mockContext';

// Some tests assert inside catch; an unexpected success must fail them.
beforeEach(() => {
	expect.hasAssertions();
});

/** Hook context whose DocuSign API call fails, so the lifecycle catch paths run. */
function failingHookContext(staticData: IDataObject) {
	const base = createMockContext({
		credentials: { docuSignOAuth2Api: { environment: 'demo' } },
		httpResponses: [createHttpError(404, { errorCode: 'NOT_FOUND', message: 'gone' })],
	});
	const warn = jest.fn();
	const ctx = Object.assign(base, {
		getWorkflowStaticData: () => staticData,
		getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc',
		getNodeParameter: () => 'acct-1',
		logger: { warn, debug: jest.fn(), info: jest.fn(), error: jest.fn() },
	}) as unknown as IHookFunctions;
	return { ctx, warn };
}

describe('webhook lifecycle error visibility', () => {
	const methods = new DocuSignTrigger().webhookMethods.default;

	it('checkExists logs the failure and reports the webhook as missing', async () => {
		const { ctx, warn } = failingHookContext({ connectId: 'c-1' });
		await expect(methods.checkExists.call(ctx)).resolves.toBe(false);
		expect(warn).toHaveBeenCalledWith(
			'DocuSign Connect configuration check failed',
			expect.objectContaining({ connectId: 'c-1' }),
		);
	});

	it('delete logs the cleanup failure and still clears the stored webhook data', async () => {
		const staticData: IDataObject = { connectId: 'c-2', hmacSecret: 's' };
		const { ctx, warn } = failingHookContext(staticData);
		await expect(methods.delete.call(ctx)).resolves.toBe(true);
		expect(warn).toHaveBeenCalledWith(
			'DocuSign Connect configuration cleanup failed',
			expect.objectContaining({ connectId: 'c-2' }),
		);
		expect(staticData).toEqual({});
	});
});

describe('execute error wrapping', () => {
	const node = new DocuSign();

	it('surfaces an API failure as NodeApiError with the item index', async () => {
		const ctx = createMockContext({
			parameters: {
				resource: { 0: 'envelope' },
				operation: { 0: 'get' },
				accountId: { 0: 'acct-1' },
				envelopeId: { 0: 'env-1' },
			},
			credentials: { docuSignOAuth2Api: { environment: 'demo' } },
			httpResponses: [createHttpError(500, { errorCode: 'BOOM', message: 'down' })],
		});
		const error = await node.execute.call(ctx).catch((e: unknown) => e);
		expect(error).toBeInstanceOf(NodeApiError);
		expect((error as NodeApiError).message).toBe('DocuSign API error [500]');
	});

	it('wraps a plain handler error in NodeOperationError', async () => {
		const ctx = createMockContext({
			parameters: { resource: { 0: 'envelope' }, operation: { 0: 'notAnOperation' }, accountId: { 0: 'acct-1' } },
			credentials: { docuSignOAuth2Api: { environment: 'demo' } },
		});
		const error = await node.execute.call(ctx).catch((e: unknown) => e);
		expect(error).toBeInstanceOf(NodeOperationError);
	});

	it('rejects an unknown resource with NodeOperationError', async () => {
		const ctx = createMockContext({ parameters: { resource: { 0: 'nope' }, operation: { 0: 'get' } } });
		const error = await node.execute.call(ctx).catch((e: unknown) => e);
		expect(error).toBeInstanceOf(NodeOperationError);
		expect((error as Error).message).toBe('Unknown resource: nope');
	});
});

describe('every resource in the picker is usable', () => {
	const node = new DocuSign();
	const { CATEGORY_RESOURCES } = jest.requireActual<typeof import('../nodes/DocuSign/utils/descriptions')>(
		'../nodes/DocuSign/utils/descriptions',
	);
	const resources = Object.values(CATEGORY_RESOURCES).flat();
	const operationProps = node.description.properties.filter((p) => p.name === 'operation');

	it.each(resources.map((r) => [r.value]))('%s shows at least one operation', (resource) => {
		const visible = operationProps.filter((p) =>
			(p.displayOptions?.show?.resource as string[] | undefined)?.includes(resource),
		);
		expect(visible.length).toBeGreaterThan(0);
	});

	it.each(resources.map((r) => [r.value]))('%s routes to a handler', async (resource) => {
		const ctx = createMockContext({
			parameters: { resource: { 0: resource }, operation: { 0: '__probe__' } },
		});
		const error = await node.execute.call(ctx).catch((e: unknown) => e);
		expect((error as Error | undefined)?.message ?? '').not.toContain('Unknown resource');
	});
});
