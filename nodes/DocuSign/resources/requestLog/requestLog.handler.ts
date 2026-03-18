import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, assertSafeId } from '../../transport';

/**
 * Handle all Request Log operations.
 * These are global diagnostic endpoints — no account prefix in the path.
 */
export async function handleRequestLog(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', 'diagnostics/request_logs');
		}

		case 'get': {
			const requestLogId = assertSafeId(
				ctx.getNodeParameter('requestLogId', i) as string,
				'Request Log ID',
			);
			return docuSignRequest(ctx, 'GET', `diagnostics/request_logs/${requestLogId}`);
		}

		case 'delete': {
			return docuSignRequest(ctx, 'DELETE', 'diagnostics/request_logs');
		}

		case 'getSettings': {
			return docuSignRequest(ctx, 'GET', 'diagnostics/settings');
		}

		case 'updateSettings': {
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new Error('Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', 'diagnostics/settings', body);
		}

		default:
			throw new Error(`Unsupported request log operation: ${operation}`);
	}
}
