import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Payment operations.
 */
export async function handlePayment(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/billing_payments`;

	switch (operation) {
		case 'list': {
			const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = {};
			if (filters.from_date) qs.from_date = filters.from_date;
			if (filters.to_date) qs.to_date = filters.to_date;
			return docuSignRequest(ctx, 'GET', basePath, undefined, qs);
		}

		case 'get': {
			const paymentId = assertSafeId(
				ctx.getNodeParameter('paymentId', i) as string,
				'Payment ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${paymentId}`);
		}

		default:
			throw new Error(`Unsupported payment operation: ${operation}`);
	}
}
