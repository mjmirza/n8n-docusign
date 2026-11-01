import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, docuSignGetAll, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Group operations.
 */
export async function handleGroup(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/groups`;

	switch (operation) {
		case 'list': {
			const returnAll = ctx.getNodeParameter('returnAll', i, false) as boolean;
			const filters = ctx.getNodeParameter('groupFilters', i, {}) as IDataObject;
			const qs: IDataObject = {};
			if (filters.groupType) qs.group_type = filters.groupType;
			if (filters.searchText) qs.search_text = filters.searchText;
			if (filters.includeUsercount !== undefined) qs.include_usercount = String(filters.includeUsercount);
			if (returnAll) {
				// Follows start_position page by page; DocuSign returns at most 100 groups per page.
				return docuSignGetAll(ctx, 'GET', basePath, 'groups', qs, Number.MAX_SAFE_INTEGER);
			}
			if (filters.count !== undefined) qs.count = String(filters.count);
			if (filters.startPosition !== undefined) qs.start_position = String(filters.startPosition);
			return docuSignRequest(ctx, 'GET', basePath, undefined, qs);
		}

		case 'create': {
			const groupName = ctx.getNodeParameter('groupName', i) as string;
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const group: IDataObject = { groupName };
			if (additionalFields.permissionProfileId) {
				group.permissionProfileId = additionalFields.permissionProfileId;
			}

			return docuSignRequest(ctx, 'POST', basePath, { groups: [group] } as unknown as IDataObject);
		}

		case 'update': {
			const groupId = assertSafeId(
				ctx.getNodeParameter('groupId', i) as string,
				'Group ID',
			);
			const groupName = ctx.getNodeParameter('updateGroupName', i) as string;

			return docuSignRequest(ctx, 'PUT', basePath, {
				groups: [{ groupId, groupName }],
			} as unknown as IDataObject);
		}

		case 'delete': {
			const groupId = assertSafeId(
				ctx.getNodeParameter('groupId', i) as string,
				'Group ID',
			);

			return docuSignRequest(ctx, 'DELETE', basePath, {
				groups: [{ groupId }],
			} as unknown as IDataObject);
		}

		default:
			throw new Error(`Unsupported group operation: ${operation}`);
	}
}
