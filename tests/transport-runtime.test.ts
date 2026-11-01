import { NodeApiError } from 'n8n-workflow';
/**
 * Tests for transport.ts runtime functions (docuSignRequest, docuSignGetAll,
 * resolveCredentials, createCrudHandler) using mocked n8n context.
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { createMockContext, createHttpError, allowOffSpecRequests, getRecordedRequests } from './helpers/mockContext';
import { docuSignRequest, docuSignGetAll, createCrudHandler } from '../nodes/DocuSign/transport';

// Some tests assert inside catch; an unexpected success must fail them.
beforeEach(() => {
	expect.hasAssertions();
});

describe('transport runtime', () => {
	describe('docuSignRequest', () => {
		it('should make a successful GET request with OAuth2 credentials', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [{ envelopeId: 'abc-123', status: 'sent' }],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1/envelopes/abc-123',
			);

			expect(result).toEqual({
				envelopeId: 'abc-123',
				status: 'sent',
			});
		});

		it('should fall back to JWT credentials when OAuth2 not configured', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignJwtApi: {
						environment: 'demo',
						accountId: 'acct-1',
					},
				},
				httpResponses: [{ ok: true }],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1/envelopes',
			);
			expect(result).toEqual({ ok: true });
		});

		it('should throw when no credentials configured', async () => {
			const ctx = createMockContext({ credentials: {} });

			await expect(
				docuSignRequest(ctx, 'GET', 'accounts/acct-1'),
			).rejects.toThrow('No DocuSign credentials configured');
		});

		it('should send body on POST requests', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [{ envelopeId: 'new-123' }],
			});

			const result = await docuSignRequest(
				ctx,
				'POST',
				'accounts/acct-1/envelopes',
				{ emailSubject: 'Test', status: 'sent' },
			);

			expect(result).toEqual({ envelopeId: 'new-123' });
		});

		it('should send query string parameters', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [{ envelopes: [] }],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1/envelopes',
				undefined,
				{ from_date: '2024-01-01', status: 'completed' },
			);

			expect(result).toEqual({ envelopes: [] });
		});

		it('should throw NodeApiError on HTTP error (non-retryable)', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(400, {
						errorCode: 'INVALID_REQUEST',
						message: 'Missing required field',
					}),
				],
			});

			try {
				await docuSignRequest(ctx, 'POST', 'accounts/acct-1/envelopes', {});
				expect(true).toBe(false); // should not reach
			} catch (err: unknown) {
				const e = err as { message: string; description?: string };
				expect(e.message).toContain('DocuSign API error');
				expect(e.description).toBe('INVALID_REQUEST: Missing required field');
			}
		});

		it('should parse OAuth error format', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(401, {
						error: 'invalid_grant',
						error_description: 'Token expired',
					}),
				],
			});

			try {
				await docuSignRequest(ctx, 'GET', 'accounts/acct-1');
				expect(true).toBe(false);
			} catch (err: unknown) {
				const e = err as { description?: string };
				expect(e.description).toBe('invalid_grant: Token expired');
			}
		});

		it('should parse errors array format', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(422, {
						errors: [
							{ message: 'Field A is invalid' },
							{ message: 'Field B is required' },
						],
					}),
				],
			});

			try {
				await docuSignRequest(ctx, 'POST', 'accounts/acct-1/envelopes', {});
				expect(true).toBe(false);
			} catch (err: unknown) {
				const e = err as { description?: string };
				expect(e.description).toBe('Field A is invalid; Field B is required');
			}
		});

		it('should parse RFC 7807 problem details format', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(403, {
						title: 'Forbidden',
						detail: 'Insufficient permissions',
					}),
				],
			});

			try {
				await docuSignRequest(ctx, 'GET', 'accounts/acct-1');
				expect(true).toBe(false);
			} catch (err: unknown) {
				const e = err as { description?: string };
				expect(e.description).toBe('Forbidden: Insufficient permissions');
			}
		});

		it('should parse string errors in array', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(422, {
						errors: ['Error one', 'Error two'],
					}),
				],
			});

			try {
				await docuSignRequest(ctx, 'POST', 'accounts/acct-1/envelopes', {});
				expect(true).toBe(false);
			} catch (err: unknown) {
				const e = err as { description?: string };
				expect(e.description).toBe('Error one; Error two');
			}
		});

		it('should handle unknown error body gracefully', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(500, null, 'Internal Server Error'),
				],
			});

			try {
				await docuSignRequest(ctx, 'GET', 'accounts/acct-1');
				expect(true).toBe(false);
			} catch (err: unknown) {
				const e = err as { description?: string };
				expect(e.description).toBe('Internal Server Error');
			}
		});

		it('should handle error with no body and no message', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [createHttpError(500, undefined, '')],
			});

			// When body is undefined and message is empty string, falls back to
			// the Error's own message ("Request failed with status 500")
			await expect(
				docuSignRequest(ctx, 'GET', 'accounts/acct-1'),
			).rejects.toThrow('DocuSign API error');
		});

		it('should handle numeric body (non-object)', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [createHttpError(500, 42, '')],
			});

			// Numeric body is not an object, parseErrorResponse returns ''
			// Falls back to the Error's own message
			await expect(
				docuSignRequest(ctx, 'GET', 'accounts/acct-1'),
			).rejects.toThrow('DocuSign API error');
		});

		it('should handle error with errorCode array containing objects', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(422, {
						errors: [{ errorCode: 'E001' }],
					}),
				],
			});

			try {
				await docuSignRequest(ctx, 'POST', 'accounts/acct-1/envelopes', {});
				expect(true).toBe(false);
			} catch (err: unknown) {
				const e = err as { description?: string };
				expect(e.description).toBe('E001');
			}
		});

		it('should handle error with errors array containing non-string/object', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(422, {
						errors: [42, true],
					}),
				],
			});

			await expect(
				docuSignRequest(ctx, 'POST', 'accounts/acct-1/envelopes', {}),
			).rejects.toThrow('DocuSign API error');
		});

		it('should handle JSON-serialized error objects in errors array', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(422, {
						errors: [{ unknownField: 'test' }],
					}),
				],
			});

			try {
				await docuSignRequest(ctx, 'POST', 'accounts/acct-1/envelopes', {});
				expect(true).toBe(false);
			} catch (err: unknown) {
				const e = err as { description?: string };
				expect(e.description).toContain('unknownField');
			}
		});

		it('should reject requests with path traversal in endpoint', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
			});

			await expect(
				docuSignRequest(ctx, 'GET', '../../../etc/passwd'),
			).rejects.toThrow('path traversal');
		});

		it('should pass encoding option for binary downloads', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [Buffer.from('PDF content')],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1/envelopes/env-1/documents/combined',
				undefined,
				undefined,
				{ encoding: null, json: false },
			);

			expect(Buffer.isBuffer(result)).toBe(true);
		});

		it('should pass returnFullResponse option', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					{ statusCode: 200, body: { ok: true } },
				],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
				undefined,
				undefined,
				{ returnFullResponse: true },
			);

			expect(result).toEqual({
				statusCode: 200,
				body: { ok: true },
			});
		});

		it('should not send empty body', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [{ ok: true }],
			});

			const result = await docuSignRequest(
				ctx,
				'POST',
				'accounts/acct-1/envelopes',
				{},
			);
			expect(result).toEqual({ ok: true });
		});

		it('should not send empty query string', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [{ ok: true }],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
				undefined,
				{},
			);
			expect(result).toEqual({ ok: true });
		});

		it('should use production base URL when environment is production', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'production' },
				},
				httpResponses: [{ ok: true }],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
			);
			expect(result).toEqual({ ok: true });
		});

		it('should default to demo when environment not specified', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: {},
				},
				httpResponses: [{ ok: true }],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
			);
			expect(result).toEqual({ ok: true });
		});

		it('should handle non-account paths (e.g., diagnostics)', async () => {
			allowOffSpecRequests(); // synthetic path, tests transport plumbing only
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [{ ok: true }],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'diagnostics/services',
			);
			expect(result).toEqual({ ok: true });
		});

		it('should retry on 429 and eventually succeed', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(429, {}, 'Rate limited', {
						'retry-after': '0',
					}),
					{ ok: true },
				],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
			);
			expect(result).toEqual({ ok: true });
		});

		it('should retry on 502 and eventually succeed', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(502, {}, 'Bad Gateway'),
					{ ok: true },
				],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
			);
			expect(result).toEqual({ ok: true });
		});

		it('should retry on 503 and respect Retry-After header', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(503, {}, 'Service Unavailable', {
						'retry-after': '1',
					}),
					{ ok: true },
				],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
			);
			expect(result).toEqual({ ok: true });
		}, 15000);

		it('should retry on 504 and succeed after multiple retries', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(504, {}, 'Gateway Timeout'),
					createHttpError(504, {}, 'Gateway Timeout'),
					{ ok: true },
				],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
			);
			expect(result).toEqual({ ok: true });
		}, 30000);

		it('should fail after max retries on persistent 429', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(429, { message: 'Rate limited' }),
					createHttpError(429, { message: 'Rate limited' }),
					createHttpError(429, { message: 'Rate limited' }),
					createHttpError(429, { message: 'Rate limited' }),
				],
			});

			await expect(
				docuSignRequest(ctx, 'GET', 'accounts/acct-1'),
			).rejects.toThrow('DocuSign API error');
		}, 60000);

		it('should ignore invalid Retry-After header values', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(429, {}, 'Rate limited', {
						'retry-after': 'invalid',
					}),
					{ ok: true },
				],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
			);
			expect(result).toEqual({ ok: true });
		});

		it('should ignore negative Retry-After header values', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(429, {}, 'Rate limited', {
						'retry-after': '-5',
					}),
					{ ok: true },
				],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
			);
			expect(result).toEqual({ ok: true });
		});

		it('should ignore oversized Retry-After header values', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(429, {}, 'Rate limited', {
						'retry-after': '999',
					}),
					{ ok: true },
				],
			});

			const result = await docuSignRequest(
				ctx,
				'GET',
				'accounts/acct-1',
			);
			expect(result).toEqual({ ok: true });
		});

		// Every DocuSignContext (execute, hook, load-options) exposes getNode, so every
		// API failure surfaces as a NodeApiError with the HTTP status and parsed reason.
		it('should throw NodeApiError with status and parsed reason for a 400', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(400, {
						errorCode: 'BAD_REQUEST',
						message: 'Invalid parameter',
					}),
				],
			});

			const error = await docuSignRequest(ctx, 'GET', 'accounts/acct-1').catch((e: unknown) => e);
			expect(error).toBeInstanceOf(NodeApiError);
			expect((error as NodeApiError).message).toBe('DocuSign API error [400]');
			expect((error as NodeApiError).description).toBe('BAD_REQUEST: Invalid parameter');
		});

		it('should fall back to the transport message when the body has no reason', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					createHttpError(404, undefined, 'Not Found'),
				],
			});

			const error = await docuSignRequest(ctx, 'GET', 'accounts/acct-1').catch((e: unknown) => e);
			expect(error).toBeInstanceOf(NodeApiError);
			expect((error as NodeApiError).message).toBe('DocuSign API error [404]');
			expect((error as NodeApiError).description).toBe('Not Found');
		});

		it('should handle custom content type', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [{ ok: true }],
			});

			const result = await docuSignRequest(
				ctx,
				'POST',
				'accounts/acct-1/envelopes',
				{ emailSubject: 'test' },
				undefined,
				{ contentType: 'multipart/form-data' },
			);
			expect(result).toEqual({ ok: true });
			expect((getRecordedRequests(ctx)[0].options.headers as Record<string, string>)['Content-Type']).toBe('multipart/form-data');
		});
	});

	describe('docuSignGetAll', () => {
		it('should fetch all items from a single page', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					{
						envelopes: [
							{ envelopeId: '1' },
							{ envelopeId: '2' },
						],
						totalSetSize: '2',
						resultSetSize: '2',
					},
				],
			});

			const results = await docuSignGetAll(
				ctx,
				'GET',
				'accounts/acct-1/envelopes',
				'envelopes',
				{},
				100,
			);

			expect(results).toHaveLength(2);
			expect(results[0]).toEqual({ envelopeId: '1' });
		});

		it('should paginate across multiple pages', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					{
						envelopes: [{ envelopeId: '1' }, { envelopeId: '2' }],
						totalSetSize: '4',
						resultSetSize: '2',
						nextUri: '/next',
					},
					{
						envelopes: [{ envelopeId: '3' }, { envelopeId: '4' }],
						totalSetSize: '4',
						resultSetSize: '2',
					},
				],
			});

			const results = await docuSignGetAll(
				ctx,
				'GET',
				'accounts/acct-1/envelopes',
				'envelopes',
				{},
				100,
			);

			expect(results).toHaveLength(4);
		});

		it('should stop when maxResults reached', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					{
						envelopes: [
							{ envelopeId: '1' },
							{ envelopeId: '2' },
							{ envelopeId: '3' },
						],
						totalSetSize: '10',
						resultSetSize: '3',
						nextUri: '/next',
					},
				],
			});

			const results = await docuSignGetAll(
				ctx,
				'GET',
				'accounts/acct-1/envelopes',
				'envelopes',
				{},
				2,
			);

			expect(results).toHaveLength(2);
		});

		it('should stop when resultSetSize is 0', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					{
						envelopes: [],
						totalSetSize: '0',
						resultSetSize: '0',
					},
				],
			});

			const results = await docuSignGetAll(
				ctx,
				'GET',
				'accounts/acct-1/envelopes',
				'envelopes',
			);

			expect(results).toHaveLength(0);
		});

		it('should stop when no nextUri', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					{
						envelopes: [{ envelopeId: '1' }],
						totalSetSize: '100',
						resultSetSize: '1',
						// no nextUri
					},
				],
			});

			const results = await docuSignGetAll(
				ctx,
				'GET',
				'accounts/acct-1/envelopes',
				'envelopes',
			);

			expect(results).toHaveLength(1);
		});

		it('should handle missing result key gracefully', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					{
						totalSetSize: '0',
						resultSetSize: '0',
					},
				],
			});

			const results = await docuSignGetAll(
				ctx,
				'GET',
				'accounts/acct-1/templates',
				'envelopeTemplates',
			);

			expect(results).toHaveLength(0);
		});

		it('should pass custom query parameters', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				httpResponses: [
					{
						envelopes: [{ envelopeId: '1' }],
						totalSetSize: '1',
						resultSetSize: '1',
					},
				],
			});

			const results = await docuSignGetAll(
				ctx,
				'GET',
				'accounts/acct-1/envelopes',
				'envelopes',
				{ status: 'completed', from_date: '2024-01-01' },
				100,
			);

			expect(results).toHaveLength(1);
		});
	});

	describe('createCrudHandler', () => {
		const handler = createCrudHandler({
			buildPath: (ctx, i) => {
				const accountId = ctx.getNodeParameter('accountId', i) as string;
				return `accounts/${accountId}/custom_fields`;
			},
			resourceLabel: 'Custom Field',
			listResultKey: 'customFields',
		});

		it('should handle list operation', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
				},
				httpResponses: [{ customFields: [{ name: 'field1' }] }],
			});

			const result = await handler(ctx, 'list', 0);
			expect(result).toEqual({ customFields: [{ name: 'field1' }] });
		});

		it('should handle get operation', async () => {
			allowOffSpecRequests(); // synthetic path, tests transport plumbing only
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
					itemId: { 0: 'field-123' },
				},
				httpResponses: [{ name: 'field1', fieldId: 'field-123' }],
			});

			const result = await handler(ctx, 'get', 0);
			expect(result).toEqual({
				name: 'field1',
				fieldId: 'field-123',
			});
		});

		it('should handle create operation', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
					requestBody: { 0: { name: 'new-field', value: 'test' } },
				},
				httpResponses: [{ fieldId: 'new-123' }],
			});

			const result = await handler(ctx, 'create', 0);
			expect(result).toEqual({ fieldId: 'new-123' });
		});

		it('should handle update operation with itemId', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
					itemId: { 0: 'field-123' },
					requestBody: { 0: { value: 'updated' } },
				},
				httpResponses: [{ fieldId: 'field-123', value: 'updated' }],
			});

			const result = await handler(ctx, 'update', 0);
			expect(result).toEqual({
				fieldId: 'field-123',
				value: 'updated',
			});
		});

		it('should handle update without itemId (bulk update)', async () => {
			allowOffSpecRequests(); // synthetic path, tests transport plumbing only
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
					itemId: { 0: '' },
					requestBody: { 0: { fields: ['a', 'b'] } },
				},
				httpResponses: [{ updated: true }],
			});

			const result = await handler(ctx, 'update', 0);
			expect(result).toEqual({ updated: true });
		});

		it('should handle delete operation', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
					itemId: { 0: 'field-123' },
				},
				httpResponses: [{}],
			});

			const result = await handler(ctx, 'delete', 0);
			expect(result).toEqual({});
		});

		it('should handle getAll operation with pagination', async () => {
			const paginatedHandler = createCrudHandler({
				buildPath: (ctx, i) => {
					const accountId = ctx.getNodeParameter('accountId', i) as string;
					return `accounts/${accountId}/templates`;
				},
				resourceLabel: 'Template',
				listResultKey: 'envelopeTemplates',
				paginated: true,
			});

			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
					maxResults: { 0: 50 },
				},
				httpResponses: [
					{
						envelopeTemplates: [{ templateId: 't1' }, { templateId: 't2' }],
						totalSetSize: '2',
						resultSetSize: '2',
					},
				],
			});

			const result = await paginatedHandler(ctx, 'getAll', 0);
			expect(result).toHaveLength(2);
		});

		it('should throw on unsupported operation', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
				},
			});

			await expect(handler(ctx, 'purge', 0)).rejects.toThrow(
				'Unsupported Custom Field operation: purge',
			);
		});

		it('should validate itemId on get', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
					itemId: { 0: 'abc/def' },
				},
			});

			await expect(handler(ctx, 'get', 0)).rejects.toThrow(
				'contains invalid characters',
			);
		});

		it('should validate itemId on delete', async () => {
			const ctx = createMockContext({
				credentials: {
					docuSignOAuth2Api: { environment: 'demo' },
				},
				parameters: {
					accountId: { 0: 'acct-1' },
					itemId: { 0: '../etc' },
				},
			});

			await expect(handler(ctx, 'delete', 0)).rejects.toThrow(
				'contains invalid characters',
			);
		});
	});
});
