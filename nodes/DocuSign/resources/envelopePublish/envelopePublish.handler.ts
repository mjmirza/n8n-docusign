import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';

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
				body = JSON.parse(raw) as IDataObject;
			} catch {
				throw new Error('Request body must be valid JSON');
			}
			return docuSignRequest(ctx, 'POST', `${basePath}/envelopes/historical`, body);
		}

		default:
			throw new Error(`Unsupported envelope publish operation: ${operation}`);
	}
}
