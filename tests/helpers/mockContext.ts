/**
 * Mock n8n execution context for unit testing handlers and transport functions.
 * Provides configurable mock implementations for all IExecuteFunctions methods.
 */
import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INode,
	IBinaryData,
} from 'n8n-workflow';

interface MockContextOptions {
	/** Parameters indexed by [name][itemIndex] */
	parameters?: Record<string, Record<number, unknown>>;
	/** Credentials indexed by credential type name */
	credentials?: Record<string, IDataObject>;
	/** Mock HTTP responses (array consumed in order) */
	httpResponses?: unknown[];
	/** Binary data available at each item index */
	binaryData?: Record<number, Record<string, IBinaryData>>;
	/** Whether continueOnFail is enabled */
	continueOnFail?: boolean;
	/** Input items */
	inputData?: INodeExecutionData[];
	/** Node type version; defaults to 1 like a workflow saved before version 2 existed */
	typeVersion?: number;
	/** Custom /oauth/userinfo answer (or an Error to throw); defaults to no accounts */
	userInfo?: unknown;
}

/** A request the mock received, in call order. Userinfo discovery calls are excluded. */
export interface RecordedRequest {
	credentialType?: string;
	options: Record<string, unknown>;
}

/** Every request recorded since the last drain, across all mock contexts. */
const allRequests: RecordedRequest[] = [];

let allowOffSpec = false;

/** Lets one test call made-up paths, for transport tests that exercise generic plumbing. */
export function allowOffSpecRequests(): void {
	allowOffSpec = true;
}

/** Reports and resets the opt-out set by allowOffSpecRequests. */
export function offSpecAllowed(): boolean {
	const value = allowOffSpec;
	allowOffSpec = false;
	return value;
}

/** Returns and clears the requests recorded since the previous call. */
export function drainAllRequests(): RecordedRequest[] {
	return allRequests.splice(0, allRequests.length);
}

/** Requests made through a context built by createMockContext. */
export function getRecordedRequests(ctx: unknown): RecordedRequest[] {
	return (ctx as { __requests: RecordedRequest[] }).__requests;
}



/**
 * Create a mock IExecuteFunctions for testing.
 */
export function createMockContext(
	options: MockContextOptions = {},
): IExecuteFunctions {
	const httpCallIndex = { current: 0 };
	const requests: RecordedRequest[] = [];


	const mockNode: INode = {
		id: 'test-node-id',
		name: 'DocuSign',
		type: 'n8n-nodes-docusign.docuSign',
		typeVersion: options.typeVersion ?? 1,
		position: [0, 0],
		parameters: {},
	};

	const ctx = {
		getNodeParameter(name: string, itemIndex: number, fallback?: unknown) {
			const paramsByIndex = options.parameters?.[name];
			if (paramsByIndex && itemIndex in paramsByIndex) {
				return paramsByIndex[itemIndex];
			}
			if (fallback !== undefined) return fallback;
			throw new Error(
				`Parameter "${name}" not found for item ${itemIndex}`,
			);
		},

		getCredentials(type: string) {
			const creds = options.credentials?.[type];
			if (creds) return Promise.resolve(creds);
			return Promise.reject(new Error(`No credentials of type "${type}"`));
		},

		getInputData() {
			return options.inputData || [{ json: {} }];
		},

		getNode() {
			return mockNode;
		},

		continueOnFail() {
			return options.continueOnFail || false;
		},

		helpers: {
			httpRequestWithAuthentication: {
				call: async (
					_thisArg: unknown,
					credentialType: string,
					requestOptions: Record<string, unknown>,
				) => {
					const url = String(requestOptions?.url ?? '');
					if (url.endsWith('/oauth/userinfo')) {
						// No accounts by default, so the transport keeps the environment host.
						if (options.userInfo instanceof Error) throw options.userInfo;
						return options.userInfo ?? { accounts: [] };
					}
					requests.push({ credentialType, options: requestOptions });
					allRequests.push({ credentialType, options: requestOptions });
					if (
						options.httpResponses &&
						httpCallIndex.current < options.httpResponses.length
					) {
						const response =
							options.httpResponses[httpCallIndex.current];
						httpCallIndex.current++;

						if (response instanceof Error) {
							throw response;
						}

						return response;
					}
					throw new Error('No mock HTTP response configured');
				},
			},
			httpRequest: async (requestOptions: Record<string, unknown>) => {
				requests.push({ options: requestOptions });
				if (
					options.httpResponses &&
					httpCallIndex.current < options.httpResponses.length
				) {
					const response =
						options.httpResponses[httpCallIndex.current];
					httpCallIndex.current++;
					return response;
				}
				throw new Error('No mock HTTP response configured');
			},
			assertBinaryData(itemIndex: number, propertyName: string) {
				const data = options.binaryData?.[itemIndex]?.[propertyName];
				if (!data) {
					throw new Error(
						`No binary data found for property "${propertyName}" at index ${itemIndex}`,
					);
				}
				return data;
			},
			getBinaryDataBuffer: async (itemIndex: number, propertyName: string) => {
				const data = options.binaryData?.[itemIndex]?.[propertyName];
				if (!data) {
					throw new Error(`No binary data found for property "${propertyName}" at index ${itemIndex}`);
				}
				return Buffer.from(data.data, 'base64');
			},
			prepareBinaryData: async (
				buffer: Buffer,
				fileName: string,
				mimeType: string,
			) => ({
				data: buffer.toString('base64'),
				fileName,
				mimeType,
				fileSize: buffer.length,
			}),
			returnJsonArray: (data: IDataObject | IDataObject[]) =>
				Array.isArray(data)
					? data.map((d) => ({ json: d }))
					: [{ json: data }],
		},
		__requests: requests,
	} as unknown as IExecuteFunctions;

	return ctx;
}

/**
 * Create a mock error that mimics n8n HTTP request errors.
 */
export function createHttpError(
	statusCode: number,
	body?: unknown,
	message?: string,
	headers?: Record<string, string>,
): Error & {
	statusCode: number;
	body: unknown;
	response?: { headers: Record<string, string> };
} {
	const error = new Error(
		message || `Request failed with status ${statusCode}`,
	) as Error & {
		statusCode: number;
		body: unknown;
		response?: { headers: Record<string, string> };
	};
	error.statusCode = statusCode;
	error.body = body || {};
	if (headers) {
		error.response = { headers };
	}
	return error;
}
