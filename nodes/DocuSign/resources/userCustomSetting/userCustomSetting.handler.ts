import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all User Custom Setting operations.
 */
export async function handleUserCustomSetting(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const userId = assertSafeId(
		ctx.getNodeParameter('userId', i) as string,
		'User ID',
	);
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/users/${userId}/custom_settings`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'update': {
			const body = JSON.parse(
				ctx.getNodeParameter('customSettings', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', basePath, body);
		}

		case 'delete': {
			const body = JSON.parse(
				ctx.getNodeParameter('customSettings', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'DELETE', basePath, body);
		}

		default:
			throw new Error(`Unsupported user custom setting operation: ${operation}`);
	}
}
