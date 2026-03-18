import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';

/**
 * Handle all Payment Gateway operations.
 */
export async function handlePaymentGateway(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/payment_gateway_accounts`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		default:
			throw new Error(`Unsupported payment gateway operation: ${operation}`);
	}
}
