import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Favorite Template operations.
 */
export async function handleFavoriteTemplate(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/favorite_templates`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'update': {
			const templateIdsStr = ctx.getNodeParameter('templateIds', i) as string;
			const favoriteTemplates = templateIdsStr.split(',').map((id) => ({
				templateId: assertSafeId(id.trim(), 'Template ID'),
			}));
			return docuSignRequest(ctx, 'PUT', basePath, { favoriteTemplates } as unknown as IDataObject);
		}

		case 'unFavorite': {
			const templateIdsStr = ctx.getNodeParameter('templateIds', i) as string;
			const favoriteTemplates = templateIdsStr.split(',').map((id) => ({
				templateId: assertSafeId(id.trim(), 'Template ID'),
			}));
			return docuSignRequest(ctx, 'DELETE', basePath, { favoriteTemplates } as unknown as IDataObject);
		}

		default:
			throw new Error(`Unsupported favorite template operation: ${operation}`);
	}
}
