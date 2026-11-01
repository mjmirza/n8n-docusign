import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

/**
 * Handle all Envelope Publish operations.
 */
export async function handleEnvelopePublish(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	);

	switch (operation) {
		case 'createHistorical': {
			const raw = ctx.getNodeParameter('requestBody', i) as string;
			let body: IDataObject;
			try {
				body = parseJsonInput(raw) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Request body must be valid JSON');
			}
			return docuSignRequest(ctx, 'POST', `${basePath}/connect/envelopes/publish/historical`, body);
		}

		default:
			throw new Error(`Unsupported envelope publish operation: ${operation}`);
	}
}
