import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Signing Group User operations.
 */
export async function handleSigningGroupUser(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const signingGroupId = assertSafeId(
		ctx.getNodeParameter('signingGroupId', i) as string,
		'Signing Group ID',
	);
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/signing_groups/${signingGroupId}/users`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'update': {
			let users: unknown;
			try {
				users = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				);
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', basePath, { users } as unknown as IDataObject);
		}

		case 'delete': {
			let users: unknown;
			try {
				users = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				);
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'DELETE', basePath, { users } as unknown as IDataObject);
		}

		default:
			throw new Error(`Unsupported signing group user operation: ${operation}`);
	}
}
