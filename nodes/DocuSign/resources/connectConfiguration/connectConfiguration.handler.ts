import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Connect Configuration operations.
 */
export async function handleConnectConfiguration(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/connect`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const connectId = assertSafeId(
				ctx.getNodeParameter('connectId', i) as string,
				'Connect ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${connectId}`);
		}

		case 'create': {
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const connectId = assertSafeId(
				ctx.getNodeParameter('connectId', i) as string,
				'Connect ID',
			);
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', `${basePath}/${connectId}`, body);
		}

		case 'delete': {
			const connectId = assertSafeId(
				ctx.getNodeParameter('connectId', i) as string,
				'Connect ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${connectId}`);
		}

		case 'getEventLog': {
			const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = {};
			if (filters.from_date) qs.from_date = filters.from_date;
			if (filters.to_date) qs.to_date = filters.to_date;
			if (filters.status) qs.status = filters.status;
			return docuSignRequest(ctx, 'GET', `${basePath}/logs`, undefined, qs);
		}

		case 'getEventFailures': {
			return docuSignRequest(ctx, 'GET', `${basePath}/failures`);
		}

		case 'deleteEventLog': {
			const logId = assertSafeId(
				ctx.getNodeParameter('logId', i) as string,
				'Log ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/logs/${logId}`);
		}

		case 'retryEventForEnvelope': {
			const envelopeId = assertSafeId(
				ctx.getNodeParameter('envelopeId', i) as string,
				'Envelope ID',
			);
			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/envelopes/${envelopeId}/retry_queue`,
			);
		}

		case 'publishToConnect': {
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
				`${basePath}/envelopes/publish/historical`,
				body,
			);
		}

		default:
			throw new Error(`Unsupported connect configuration operation: ${operation}`);
	}
}
