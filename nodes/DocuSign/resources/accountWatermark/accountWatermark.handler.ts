import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
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

		case 'preview':
		case 'update': {
			const watermarkSettings = { ...ctx.getNodeParameter('watermarkSettings', i, {}) as IDataObject };
			if (ctx.getNode().typeVersion >= 4) {
				const allowedValues: Record<string, string[]> = {
					displayAngle: ['0', '45', '90'],
					font: ['courier', 'helvetica', 'timesnewroman'],
					transparency: ['5', '10', '15', '20', '25', '30', '35', '40', '45'],
				};
				for (const [field, allowed] of Object.entries(allowedValues)) {
					if (watermarkSettings[field] === undefined) continue;
					const value = field === 'font' ? String(watermarkSettings[field]).toLowerCase() : String(watermarkSettings[field]);
					if (!allowed.includes(value)) {
						throw new NodeOperationError(ctx.getNode(), `${field} must be one of ${allowed.join(', ')}`, { itemIndex: i });
					}
					if (field === 'font') watermarkSettings[field] = value;
				}
			}
			return docuSignRequest(ctx, 'PUT', operation === 'preview' ? `${basePath}/preview` : basePath, watermarkSettings);
		}

		default:
			throw new Error(`Unsupported account watermark operation: ${operation}`);
	}
}
