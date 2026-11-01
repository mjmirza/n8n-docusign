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
			// DocuSign only exposes per-user rules for the signed-in user: GET /current_user/password_rules.
			// The User ID field is kept for saved workflows and only validated.
			assertSafeId(ctx.getNodeParameter('userId', i) as string, 'User ID');
			return docuSignRequest(ctx, 'GET', 'current_user/password_rules');
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
