import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
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
			// DocuSign exposes envelope comments as a PDF transcript: GET .../comments/transcript.
			const pdf = (await docuSignRequest(ctx, 'GET', `${envPath}/comments/transcript`, undefined, undefined, {
				encoding: 'arraybuffer',
				json: false,
			})) as Buffer;
			const fileName = 'comments_transcript.pdf';
			const binary = await ctx.helpers.prepareBinaryData(pdf, fileName, 'application/pdf');
			return { json: { fileName }, binary: { data: binary } } as INodeExecutionData;
		}

		default:
			throw new Error(`Unsupported envelope comment operation: ${operation}`);
	}
}
