import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';

/**
 * Handle all Account Watermark operations.
 */
export async function handleAccountWatermark(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/watermark`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'preview': {
			const watermarkSettings = ctx.getNodeParameter('watermarkSettings', i, {}) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/preview`, watermarkSettings);
		}

		case 'update': {
			const watermarkSettings = ctx.getNodeParameter('watermarkSettings', i, {}) as IDataObject;
			return docuSignRequest(ctx, 'PUT', basePath, watermarkSettings);
		}

		default:
			throw new Error(`Unsupported account watermark operation: ${operation}`);
	}
}
