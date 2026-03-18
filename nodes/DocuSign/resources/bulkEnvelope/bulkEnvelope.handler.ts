import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Bulk Envelope operations.
 */
export async function handleBulkEnvelope(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/bulk_send_lists`;

	switch (operation) {
		case 'listBulkSendLists': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'getBulkSendList': {
			const bulkSendListId = assertSafeId(
				ctx.getNodeParameter('bulkSendListId', i) as string,
				'Bulk Send List ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${bulkSendListId}`);
		}

		case 'createBulkSendList': {
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new Error('Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'updateBulkSendList': {
			const bulkSendListId = assertSafeId(
				ctx.getNodeParameter('bulkSendListId', i) as string,
				'Bulk Send List ID',
			);
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('updateBody', i) as string,
				) as IDataObject;
			} catch {
				throw new Error('Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', `${basePath}/${bulkSendListId}`, body);
		}

		case 'deleteBulkSendList': {
			const bulkSendListId = assertSafeId(
				ctx.getNodeParameter('bulkSendListId', i) as string,
				'Bulk Send List ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${bulkSendListId}`);
		}

		case 'sendBulk': {
			const bulkSendListId = assertSafeId(
				ctx.getNodeParameter('bulkSendListId', i) as string,
				'Bulk Send List ID',
			);
			const envelopeOrTemplateId = assertSafeId(
				ctx.getNodeParameter('envelopeOrTemplateId', i) as string,
				'Envelope or Template ID',
			);
			const body: IDataObject = { envelopeOrTemplateId };
			return docuSignRequest(
				ctx,
				'POST',
				`${basePath}/${bulkSendListId}/send`,
				body,
			);
		}

		default:
			throw new Error(`Unsupported bulk envelope operation: ${operation}`);
	}
}
