import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const RETRY_CODES = new Set([429, 502, 503, 504]);
const MAX_ERROR_LENGTH = 1_000;
const MAX_ERROR_ITEMS = 10;

const DOCUSIGN_BASE_URLS: Record<string, string> = {
	demo: 'https://demo.docusign.net/restapi/v2.1',
	production: 'https://www.docusign.net/restapi/v2.1',
};

/** Context types that can make API requests */
export type DocuSignContext =
	| IExecuteFunctions
	| IHookFunctions
	| ILoadOptionsFunctions;

// ---------------------------------------------------------------------------
// Helpers — exported for testing
// ---------------------------------------------------------------------------

/**
 * Get the DocuSign REST API base URL for the given environment.
 */
export function getBaseUrl(environment: string): string {
	const url = DOCUSIGN_BASE_URLS[environment];
	if (!url) {
		throw new Error(
			`Invalid DocuSign environment: "${environment}". Use "demo" or "production".`,
		);
	}
	return url;
}

/**
 * Validate and sanitise an ID parameter.
 * DocuSign uses GUIDs (with hyphens), numeric IDs, and special values like "combined", "archive", "certificate".
 */
export function assertSafeId(value: string | number, label = 'ID'): string {
	const s = String(value).trim();

	if (s.length === 0 || s.length > 255) {
		throw new Error(`${label} must be between 1 and 255 characters`);
	}

	// Allow alphanumeric, hyphens, underscores (covers GUIDs and numeric IDs)
	if (!/^[a-zA-Z0-9_-]+$/.test(s)) {
		// Do NOT include the raw value in error messages — prevents leaking sensitive data
		throw new Error(`${label} contains invalid characters`);
	}

	return s;
}

/**
 * Sanitise an API endpoint path to prevent path traversal attacks.
 */
export function sanitizeEndpoint(endpoint: string): string {
	let clean = endpoint.replace(/^\/+/, '');

	// M2 fix: Decode percent-encoded characters before traversal check
	// This prevents bypasses like %2e%2e%2f (../), %2e (.), etc.
	let decoded: string;
	try {
		decoded = decodeURIComponent(clean);
	} catch {
		throw new Error('Invalid endpoint: contains malformed percent-encoding');
	}

	// Block path traversal on both raw and decoded forms
	if (
		/\.\.[\\/]/.test(clean) ||
		clean.includes('..') ||
		/\.\.[\\/]/.test(decoded) ||
		decoded.includes('..')
	) {
		throw new Error('Invalid endpoint: path traversal is not allowed');
	}

	// Only allow safe URL characters (% removed to prevent double-encoding tricks)
	if (!/^[a-zA-Z0-9\-_/.[\]?&=,]+$/.test(clean)) {
		throw new Error('Invalid endpoint: contains disallowed characters');
	}

	return clean;
}

/**
 * Parse Retry-After header value into milliseconds.
 */
function parseRetryAfter(value?: string): number | undefined {
	if (!value) return undefined;
	const seconds = parseInt(value, 10);
	if (!isNaN(seconds) && seconds > 0 && seconds < 300) {
		return seconds * 1_000;
	}
	return undefined;
}

/**
 * Parse a DocuSign error response into a human-readable message.
 * Handles multiple DocuSign error response formats.
 */
function parseErrorResponse(body: unknown): string {
	if (!body || typeof body !== 'object') return '';

	const obj = body as Record<string, unknown>;

	// Format 1: { errorCode, message } — most common DocuSign error
	if (typeof obj.message === 'string' && obj.message) {
		const code = typeof obj.errorCode === 'string' ? `${obj.errorCode}: ` : '';
		return `${code}${obj.message}`.slice(0, MAX_ERROR_LENGTH);
	}

	// Format 2: { error, error_description } — OAuth errors
	if (typeof obj.error === 'string' && obj.error) {
		const desc =
			typeof obj.error_description === 'string'
				? `: ${obj.error_description}`
				: '';
		return `${obj.error}${desc}`.slice(0, MAX_ERROR_LENGTH);
	}

	// Format 3: { errors: [...] } — validation errors
	if (Array.isArray(obj.errors)) {
		const parts: string[] = [];
		for (
			let idx = 0;
			idx < Math.min(obj.errors.length, MAX_ERROR_ITEMS);
			idx++
		) {
			const e = obj.errors[idx];
			if (typeof e === 'string') {
				parts.push(e);
			} else if (typeof e === 'object' && e !== null) {
				const errObj = e as Record<string, unknown>;
				parts.push(
					(errObj.message as string) ||
						(errObj.errorCode as string) ||
						JSON.stringify(e),
				);
			}
		}
		return parts.join('; ').slice(0, MAX_ERROR_LENGTH);
	}

	// Format 4: { title, detail } — RFC 7807 problem details
	if (typeof obj.title === 'string' && obj.title) {
		const detail =
			typeof obj.detail === 'string' ? `: ${obj.detail}` : '';
		return `${obj.title}${detail}`.slice(0, MAX_ERROR_LENGTH);
	}

	return '';
}

// ---------------------------------------------------------------------------
// Credential resolution
// ---------------------------------------------------------------------------

interface ResolvedCredentials {
	credentialType: string;
	environment: string;
}

/**
 * Resolve which credential type is configured and extract the environment.
 */
async function resolveCredentials(
	ctx: DocuSignContext,
): Promise<ResolvedCredentials> {
	// Try OAuth2 first (most common)
	try {
		const oauthCreds = await ctx.getCredentials('docuSignOAuth2Api');
		return {
			credentialType: 'docuSignOAuth2Api',
			environment: (oauthCreds.environment as string) || 'demo',
		};
	} catch {
		// Not configured, try JWT
	}

	try {
		const jwtCreds = await ctx.getCredentials('docuSignJwtApi');
		return {
			credentialType: 'docuSignJwtApi',
			environment: (jwtCreds.environment as string) || 'demo',
		};
	} catch {
		// Not configured either
	}

	throw new Error(
		'No DocuSign credentials configured. Please add OAuth2 or JWT credentials.',
	);
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

export interface DocuSignRequestOptions {
	returnFullResponse?: boolean;
	encoding?: null | string;
	json?: boolean;
	contentType?: string;
}

/**
 * Make an authenticated request to the DocuSign eSign REST API.
 *
 * - Automatically resolves credentials (OAuth2 or JWT)
 * - Builds the full URL from the account path
 * - Retries transient errors with exponential backoff + jitter
 * - Parses DocuSign-specific error responses into NodeApiError
 */
export async function docuSignRequest(
	ctx: DocuSignContext,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
	options?: DocuSignRequestOptions,
): Promise<unknown> {
	const { credentialType, environment } = await resolveCredentials(ctx);
	const baseUrl = getBaseUrl(environment);

	// Sanitize path
	const cleanPath = sanitizeEndpoint(path);

	// Build the full URL — paths starting with "accounts/" are already absolute
	let fullUrl: string;
	if (
		cleanPath.startsWith('accounts/') ||
		cleanPath.startsWith('oauth/')
	) {
		fullUrl = `${baseUrl}/${cleanPath}`;
	} else {
		fullUrl = `${baseUrl}/${cleanPath}`;
	}

	const requestOptions: IHttpRequestOptions = {
		method,
		url: fullUrl,
		headers: {
			Accept: 'application/json',
			'Content-Type': options?.contentType || 'application/json',
		},
		json: options?.json !== false,
		timeout: 30_000,
	};

	if (options?.encoding !== undefined) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(requestOptions as any).encoding = options.encoding;
	}

	if (options?.returnFullResponse) {
		requestOptions.returnFullResponse = true;
	}

	if (body && Object.keys(body).length > 0) {
		requestOptions.body = body;
	}

	if (qs && Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}

	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			return await ctx.helpers.httpRequestWithAuthentication.call(
				ctx,
				credentialType,
				requestOptions,
			);
		} catch (error: unknown) {
			const err = error as {
				statusCode?: number;
				message?: string;
				body?: unknown;
				response?: { headers?: Record<string, string> };
			};

			// Retry on transient errors
			if (
				attempt < MAX_RETRIES &&
				err.statusCode &&
				RETRY_CODES.has(err.statusCode)
			) {
				const retryAfterMs = parseRetryAfter(
					err.response?.headers?.['retry-after'],
				);
				const baseDelay = Math.min(
					1_000 * Math.pow(2, attempt),
					10_000,
				);
				const jitter = Math.random() * baseDelay * 0.25;
				const delay = retryAfterMs || baseDelay + jitter;
				await new Promise((resolve) => setTimeout(resolve, delay));
				lastError = err as Error;
				continue;
			}

			// Parse the error and throw NodeApiError for proper n8n UI display
			const parsed = parseErrorResponse(err.body);
			const msg =
				parsed || err.message || 'Unknown DocuSign API error';

			// Use NodeApiError if we have a node context (IExecuteFunctions)
			if ('getNode' in ctx) {
				throw new NodeApiError(ctx.getNode(), err as JsonObject, {
					message: `DocuSign API error [${err.statusCode || 'unknown'}]`,
					description: msg.slice(0, MAX_ERROR_LENGTH),
				});
			}

			throw new Error(
				`DocuSign API error [${err.statusCode || 'unknown'}]: ${msg.slice(0, MAX_ERROR_LENGTH)}`,
			);
		}
	}

	// Safety net — should never be reached due to the throw inside the loop,
	// but TypeScript requires a return/throw after the for loop.
	/* istanbul ignore next */
	throw lastError || new Error('DocuSign request failed after retries');
}

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

/**
 * Build the account-scoped base path: `/accounts/{accountId}`
 */
export function accountPath(accountId: string): string {
	const safeId = assertSafeId(accountId, 'Account ID');
	return `accounts/${safeId}`;
}

/**
 * Build an envelope-scoped path: `/accounts/{accountId}/envelopes/{envelopeId}`
 */
export function envelopePath(accountId: string, envelopeId: string): string {
	return `${accountPath(accountId)}/envelopes/${assertSafeId(envelopeId, 'Envelope ID')}`;
}

/**
 * Build a template-scoped path: `/accounts/{accountId}/templates/{templateId}`
 */
export function templatePath(accountId: string, templateId: string): string {
	return `${accountPath(accountId)}/templates/${assertSafeId(templateId, 'Template ID')}`;
}

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------

/**
 * Fetch all results from a paginated DocuSign endpoint.
 *
 * DocuSign uses `resultSetSize`, `startPosition`, `totalSetSize`, `nextUri`.
 */
export async function docuSignGetAll(
	ctx: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	resultKey: string,
	qs: IDataObject = {},
	maxResults = 500,
): Promise<unknown[]> {
	const results: unknown[] = [];
	let startPosition = 0;
	const count = Math.min(maxResults, 100);

	for (let page = 0; page < 50; page++) {
		const pageQs = {
			...qs,
			count: String(count),
			start_position: String(startPosition),
		};
		const response = (await docuSignRequest(
			ctx,
			method,
			path,
			undefined,
			pageQs,
		)) as Record<string, unknown>;

		const items = response[resultKey];
		if (Array.isArray(items)) {
			results.push(...items);
		}

		const totalSetSize = parseInt(
			String(response.totalSetSize || '0'),
			10,
		);
		const resultSetSize = parseInt(
			String(response.resultSetSize || '0'),
			10,
		);

		if (
			results.length >= maxResults ||
			results.length >= totalSetSize ||
			resultSetSize === 0 ||
			!response.nextUri
		) {
			break;
		}

		startPosition += resultSetSize;
	}

	return results.slice(0, maxResults);
}

// ---------------------------------------------------------------------------
// Generic CRUD factory
// ---------------------------------------------------------------------------

/**
 * Generic handler for simple CRUD sub-resources.
 * Reduces boilerplate for resources that follow standard REST patterns.
 */
export function createCrudHandler(config: {
	buildPath: (
		ctx: IExecuteFunctions,
		i: number,
	) => string;
	resourceLabel: string;
	/** The key containing items in list responses (e.g., 'envelopeTemplates') */
	listResultKey?: string;
	/** Whether the list endpoint supports pagination */
	paginated?: boolean;
}) {
	return async function handler(
		ctx: IExecuteFunctions,
		operation: string,
		i: number,
	): Promise<unknown> {
		const basePath = config.buildPath(ctx, i);

		switch (operation) {
			case 'create': {
				const body = ctx.getNodeParameter(
					'requestBody',
					i,
					{},
				) as IDataObject;
				return docuSignRequest(ctx, 'POST', basePath, body);
			}

			case 'get': {
				const itemId = assertSafeId(
					ctx.getNodeParameter('itemId', i) as string,
					`${config.resourceLabel} ID`,
				);
				return docuSignRequest(ctx, 'GET', `${basePath}/${itemId}`);
			}

			case 'getAll':
			case 'list': {
				if (config.paginated && config.listResultKey) {
					const maxResults = ctx.getNodeParameter(
						'maxResults',
						i,
						100,
					) as number;
					return docuSignGetAll(
						ctx,
						'GET',
						basePath,
						config.listResultKey,
						{},
						maxResults,
					);
				}
				return docuSignRequest(ctx, 'GET', basePath);
			}

			case 'update': {
				const body = ctx.getNodeParameter(
					'requestBody',
					i,
					{},
				) as IDataObject;
				const itemId = ctx.getNodeParameter('itemId', i, '') as string;
				const path = itemId
					? `${basePath}/${assertSafeId(itemId, `${config.resourceLabel} ID`)}`
					: basePath;
				return docuSignRequest(ctx, 'PUT', path, body);
			}

			case 'delete': {
				const itemId = assertSafeId(
					ctx.getNodeParameter('itemId', i) as string,
					`${config.resourceLabel} ID`,
				);
				return docuSignRequest(
					ctx,
					'DELETE',
					`${basePath}/${itemId}`,
				);
			}

			default:
				throw new Error(
					`Unsupported ${config.resourceLabel} operation: ${operation}`,
				);
		}
	};
}
