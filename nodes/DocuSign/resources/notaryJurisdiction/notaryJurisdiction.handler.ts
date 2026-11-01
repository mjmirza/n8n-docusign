import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, assertSafeId } from '../../transport';

/**
 * Handle all Notary Jurisdiction operations.
 * These use /current_user/ path — no account prefix.
 */
export async function handleNotaryJurisdiction(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = 'current_user/notary/jurisdictions';

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const jurisdictionId = assertSafeId(
				ctx.getNodeParameter('jurisdictionId', i) as string,
				'Jurisdiction ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${jurisdictionId}`);
		}

		case 'create': {
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const jurisdictionId = assertSafeId(
				ctx.getNodeParameter('jurisdictionId', i) as string,
				'Jurisdiction ID',
			);
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', `${basePath}/${jurisdictionId}`, body);
		}

		case 'delete': {
			const jurisdictionId = assertSafeId(
				ctx.getNodeParameter('jurisdictionId', i) as string,
				'Jurisdiction ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${jurisdictionId}`);
		}

		default:
			throw new Error(`Unsupported notary jurisdiction operation: ${operation}`);
	}
}
