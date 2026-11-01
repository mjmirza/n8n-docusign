import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

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
				body = parseJsonInput(
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
				body = parseJsonInput(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			// Updates go to PUT /connect with the configuration's connectId inside the body.
			return docuSignRequest(ctx, 'PUT', basePath, { ...body, connectId });
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
			// GET connect/logs has no status parameter, so Status filters the returned log entries.
			const response = (await docuSignRequest(ctx, 'GET', `${basePath}/logs`, undefined, qs)) as IDataObject;
			if (!filters.status || !Array.isArray(response?.logs)) return response;
			const wanted = String(filters.status).toLowerCase();
			const logs = (response.logs as IDataObject[]).filter((l) => String(l.status ?? '').toLowerCase() === wanted);
			return { ...response, logs };
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
				body = parseJsonInput(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			// The spec body is { config, envelopes: [{ envelopeId }] }; an older envelopeIds list is converted.
			if (Array.isArray(body.envelopeIds) && body.envelopes === undefined) {
				const { envelopeIds, ...rest } = body;
				body = { ...rest, envelopes: (envelopeIds as unknown[]).map((envelopeId) => ({ envelopeId: String(envelopeId) })) };
			}
			// Historical republish is POST .../connect/envelopes/publish/historical.
			return docuSignRequest(
				ctx,
				'POST',
				`${basePath}/envelopes/publish/historical`,
				body,
			);
		}

		default:
			throw new Error(`Unsupported connect configuration operation: ${operation}`);
	}
}
