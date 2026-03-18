import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all PowerForm operations.
 */
export async function handlePowerForm(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/powerforms`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const powerFormId = assertSafeId(
				ctx.getNodeParameter('powerFormId', i) as string,
				'PowerForm ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${powerFormId}`);
		}

		case 'create': {
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

		case 'update': {
			const powerFormId = assertSafeId(
				ctx.getNodeParameter('powerFormId', i) as string,
				'PowerForm ID',
			);
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new Error('Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', `${basePath}/${powerFormId}`, body);
		}

		case 'delete': {
			const powerFormId = assertSafeId(
				ctx.getNodeParameter('powerFormId', i) as string,
				'PowerForm ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${powerFormId}`);
		}

		case 'deleteList': {
			const idsStr = ctx.getNodeParameter('powerFormIds', i) as string;
			const powerFormIds = idsStr.split(',').map((id) => id.trim()).filter(Boolean);
			for (const id of powerFormIds) {
				assertSafeId(id, 'PowerForm ID');
			}
			return docuSignRequest(ctx, 'DELETE', basePath, { powerFormIds } as unknown as IDataObject);
		}

		case 'listSenders': {
			return docuSignRequest(ctx, 'GET', `${basePath}/senders`);
		}

		default:
			throw new Error(`Unsupported PowerForm operation: ${operation}`);
	}
}
