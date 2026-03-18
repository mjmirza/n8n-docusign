import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Group Brand operations.
 */
export async function handleGroupBrand(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const groupId = assertSafeId(
		ctx.getNodeParameter('groupId', i) as string,
		'Group ID',
	);
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/groups/${groupId}/brands`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'update': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);

			return docuSignRequest(ctx, 'PUT', basePath, {
				brands: [{ brandId }],
			} as unknown as IDataObject);
		}

		case 'delete': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);

			return docuSignRequest(ctx, 'DELETE', basePath, {
				brands: [{ brandId }],
			} as unknown as IDataObject);
		}

		default:
			throw new Error(`Unsupported group brand operation: ${operation}`);
	}
}
