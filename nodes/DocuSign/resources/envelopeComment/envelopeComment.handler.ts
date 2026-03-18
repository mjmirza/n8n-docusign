import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, envelopePath } from '../../transport';

/**
 * Handle all Envelope Comment operations.
 */
export async function handleEnvelopeComment(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const envPath = envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	);

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', `${envPath}/comments`);
		}

		default:
			throw new Error(`Unsupported envelope comment operation: ${operation}`);
	}
}
