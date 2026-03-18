import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, envelopePath } from '../../transport';

export async function handleEnvelopeFormData(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	)}/form_data`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}
		default:
			throw new Error(`Unsupported envelope form data operation: ${operation}`);
	}
}
