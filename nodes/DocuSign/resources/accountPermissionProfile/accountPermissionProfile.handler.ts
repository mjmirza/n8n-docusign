import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Account Permission Profile operations.
 */
export async function handleAccountPermissionProfile(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/permission_profiles`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const profileId = assertSafeId(
				ctx.getNodeParameter('permissionProfileId', i) as string,
				'Permission Profile ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${profileId}`);
		}

		case 'create': {
			const body: IDataObject = {
				permissionProfileName: ctx.getNodeParameter('permissionProfileName', i) as string,
			};
			const settings = ctx.getNodeParameter('settings', i, {}) as IDataObject;
			if (Object.keys(settings).length > 0) {
				body.settings = settings;
			}
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const profileId = assertSafeId(
				ctx.getNodeParameter('permissionProfileId', i) as string,
				'Permission Profile ID',
			);
			const body: IDataObject = {};
			const settings = ctx.getNodeParameter('settings', i, {}) as IDataObject;
			if (Object.keys(settings).length > 0) {
				body.settings = settings;
			}
			return docuSignRequest(ctx, 'PUT', `${basePath}/${profileId}`, body);
		}

		case 'delete': {
			const profileId = assertSafeId(
				ctx.getNodeParameter('permissionProfileId', i) as string,
				'Permission Profile ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${profileId}`);
		}

		default:
			throw new Error(`Unsupported account permission profile operation: ${operation}`);
	}
}
