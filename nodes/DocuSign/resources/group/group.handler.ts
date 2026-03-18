import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

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
			return docuSignRequest(ctx, 'GET', basePath);
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
