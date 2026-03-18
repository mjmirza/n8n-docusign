import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all PowerForm Data operations.
 */
export async function handlePowerFormData(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const accountId = ctx.getNodeParameter('accountId', i) as string;
	const powerFormId = assertSafeId(
		ctx.getNodeParameter('powerFormId', i) as string,
		'PowerForm ID',
	);
	const basePath = `${accountPath(accountId)}/powerforms/${powerFormId}/form_data`;

	switch (operation) {
		case 'list': {
			const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = {};
			if (filters.from_date) qs.from_date = filters.from_date;
			if (filters.to_date) qs.to_date = filters.to_date;
			if (filters.data_layout) qs.data_layout = filters.data_layout;
			return docuSignRequest(ctx, 'GET', basePath, undefined, qs);
		}

		default:
			throw new Error(`Unsupported PowerForm Data operation: ${operation}`);
	}
}
