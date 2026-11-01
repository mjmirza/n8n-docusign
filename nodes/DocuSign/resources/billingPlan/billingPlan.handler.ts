import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Billing Plan operations.
 */
export async function handleBillingPlan(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	switch (operation) {
		// Global endpoints (no account scope)
		case 'list': {
			return docuSignRequest(ctx, 'GET', 'billing_plans');
		}

		case 'get': {
			const planId = assertSafeId(
				ctx.getNodeParameter('planId', i) as string,
				'Plan ID',
			);
			return docuSignRequest(ctx, 'GET', `billing_plans/${planId}`);
		}

		// Account-scoped endpoints
		case 'getAccountPlan': {
			const base = accountPath(
				ctx.getNodeParameter('accountId', i) as string,
			);
			return docuSignRequest(ctx, 'GET', `${base}/billing_plan`);
		}

		case 'getCreditCard': {
			const base = accountPath(
				ctx.getNodeParameter('accountId', i) as string,
			);
			return docuSignRequest(ctx, 'GET', `${base}/billing_plan/credit_card`);
		}

		case 'getDowngradeRequestBillingInfo': {
			const base = accountPath(
				ctx.getNodeParameter('accountId', i) as string,
			);
			return docuSignRequest(ctx, 'GET', `${base}/billing_plan/downgrade`);
		}

		case 'purchaseEnvelopes': {
			const base = accountPath(
				ctx.getNodeParameter('accountId', i) as string,
			);
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(
				ctx,
				'PUT',
				`${base}/billing_plan/purchased_envelopes`,
				body,
			);
		}

		case 'update': {
			const base = accountPath(
				ctx.getNodeParameter('accountId', i) as string,
			);
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('updateBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', `${base}/billing_plan`, body);
		}

		case 'updateDowngrade': {
			const base = accountPath(
				ctx.getNodeParameter('accountId', i) as string,
			);
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('downgradeBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(
				ctx,
				'PUT',
				`${base}/billing_plan/downgrade`,
				body,
			);
		}

		default:
			throw new Error(`Unsupported billing plan operation: ${operation}`);
	}
}
