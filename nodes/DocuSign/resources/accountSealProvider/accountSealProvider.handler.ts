import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';

/**
 * Handle all Account Seal Provider operations.
 */
export async function handleAccountSealProvider(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/seals`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		default:
			throw new Error(`Unsupported account seal provider operation: ${operation}`);
	}
}
