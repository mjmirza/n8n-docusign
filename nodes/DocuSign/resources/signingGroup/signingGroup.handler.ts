import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Signing Group operations.
 */
export async function handleSigningGroup(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/signing_groups`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const signingGroupId = assertSafeId(
				ctx.getNodeParameter('signingGroupId', i) as string,
				'Signing Group ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${signingGroupId}`);
		}

		case 'create': {
			let groups: unknown;
			try {
				groups = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				);
			} catch {
				throw new Error('Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'POST', basePath, { groups } as unknown as IDataObject);
		}

		case 'update': {
			let groups: unknown;
			try {
				groups = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				);
			} catch {
				throw new Error('Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', basePath, { groups } as unknown as IDataObject);
		}

		case 'updateList': {
			let groups: unknown;
			try {
				groups = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				);
			} catch {
				throw new Error('Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', basePath, { groups } as unknown as IDataObject);
		}

		case 'delete': {
			let groups: unknown;
			try {
				groups = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				);
			} catch {
				throw new Error('Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'DELETE', basePath, { groups } as unknown as IDataObject);
		}

		default:
			throw new Error(`Unsupported signing group operation: ${operation}`);
	}
}
