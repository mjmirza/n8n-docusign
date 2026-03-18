import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Group User operations.
 */
export async function handleGroupUser(
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
	)}/groups/${groupId}/users`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'update': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const user: IDataObject = { userId };
			if (additionalFields.userName) user.userName = additionalFields.userName;
			if (additionalFields.email) user.email = additionalFields.email;

			return docuSignRequest(ctx, 'PUT', basePath, { users: [user] } as unknown as IDataObject);
		}

		case 'delete': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);

			return docuSignRequest(ctx, 'DELETE', basePath, {
				users: [{ userId }],
			} as unknown as IDataObject);
		}

		default:
			throw new Error(`Unsupported group user operation: ${operation}`);
	}
}
