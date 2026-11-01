import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Custom Tab operations.
 */
export async function handleCustomTab(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/tab_definitions`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const customTabId = assertSafeId(
				ctx.getNodeParameter('customTabId', i) as string,
				'Custom Tab ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${customTabId}`);
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
			const customTabId = assertSafeId(
				ctx.getNodeParameter('customTabId', i) as string,
				'Custom Tab ID',
			);
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', `${basePath}/${customTabId}`, body);
		}

		case 'delete': {
			const customTabId = assertSafeId(
				ctx.getNodeParameter('customTabId', i) as string,
				'Custom Tab ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${customTabId}`);
		}

		default:
			throw new Error(`Unsupported custom tab operation: ${operation}`);
	}
}
