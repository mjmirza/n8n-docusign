import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Folder operations.
 */
export async function handleFolder(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/folders`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'listItems': {
			const folderId = assertSafeId(
				ctx.getNodeParameter('folderId', i) as string,
				'Folder ID',
			);
			const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = {};
			if (filters.start_position !== undefined) qs.start_position = filters.start_position;
			if (filters.count !== undefined) qs.count = filters.count;
			if (filters.status) qs.status = filters.status;
			if (filters.from_date) qs.from_date = filters.from_date;
			if (filters.to_date) qs.to_date = filters.to_date;
			if (filters.search_text) qs.search_text = filters.search_text;
			if (filters.include_items !== undefined) qs.include_items = filters.include_items;
			return docuSignRequest(ctx, 'GET', `${basePath}/${folderId}/items`, undefined, qs);
		}

		case 'moveEnvelopes': {
			const folderId = assertSafeId(
				ctx.getNodeParameter('folderId', i) as string,
				'Folder ID',
			);
			const idsStr = ctx.getNodeParameter('envelopeIds', i) as string;
			const envelopeIds = idsStr.split(',').map((id) => id.trim()).filter(Boolean);
			for (const id of envelopeIds) {
				assertSafeId(id, 'Envelope ID');
			}
			const fromFolderId = assertSafeId(
				ctx.getNodeParameter('fromFolderId', i) as string,
				'From Folder ID',
			);
			return docuSignRequest(ctx, 'PUT', `${basePath}/${folderId}`, {
				envelopeIds,
				fromFolderId,
			} as unknown as IDataObject);
		}

		case 'search': {
			const searchFolderId = assertSafeId(
				ctx.getNodeParameter('searchFolderId', i) as string,
				'Search Folder ID',
			);
			const searchFilters = ctx.getNodeParameter('searchFilters', i, {}) as IDataObject;
			const qs: IDataObject = {};
			if (searchFilters.search_text) qs.search_text = searchFilters.search_text;
			if (searchFilters.count !== undefined) qs.count = searchFilters.count;
			if (searchFilters.start_position !== undefined) qs.start_position = searchFilters.start_position;
			if (searchFilters.include_recipients !== undefined) qs.include_recipients = searchFilters.include_recipients;
			if (searchFilters.order) qs.order = searchFilters.order;
			if (searchFilters.order_by) qs.order_by = searchFilters.order_by;

			const accountBasePath = accountPath(
				ctx.getNodeParameter('accountId', i) as string,
			);
			return docuSignRequest(ctx, 'GET', `${accountBasePath}/search_folders/${searchFolderId}`, undefined, qs);
		}

		default:
			throw new Error(`Unsupported folder operation: ${operation}`);
	}
}
