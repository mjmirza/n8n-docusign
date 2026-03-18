import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';

/**
 * Handle all Account Signature Provider operations.
 */
export async function handleAccountSignatureProvider(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/signatureProviders`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		default:
			throw new Error(`Unsupported account signature provider operation: ${operation}`);
	}
}
