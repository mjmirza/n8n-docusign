import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Account Password Rule operations.
 */
export async function handleAccountPasswordRule(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/settings/password_rules`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'getForUser': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${userId}`);
		}

		case 'update': {
			const body = JSON.parse(
				ctx.getNodeParameter('passwordRules', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', basePath, body);
		}

		default:
			throw new Error(`Unsupported account password rule operation: ${operation}`);
	}
}
