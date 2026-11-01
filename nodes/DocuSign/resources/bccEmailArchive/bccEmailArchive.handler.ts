import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all BCC Email Archive operations.
 */
export async function handleBccEmailArchive(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/settings/bcc_email_archives`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const bccEmailArchiveId = assertSafeId(
				ctx.getNodeParameter('bccEmailArchiveId', i) as string,
				'BCC Email Archive ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${bccEmailArchiveId}`);
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

		case 'delete': {
			const bccEmailArchiveId = assertSafeId(
				ctx.getNodeParameter('bccEmailArchiveId', i) as string,
				'BCC Email Archive ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${bccEmailArchiveId}`);
		}

		default:
			throw new Error(`Unsupported BCC email archive operation: ${operation}`);
	}
}
