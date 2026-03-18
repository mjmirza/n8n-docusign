import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';

/**
 * Handle all Document resource operations.
 */
export async function handleDocument(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	)}/documents`;

	switch (operation) {
		case 'getAll': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'download': {
			const documentId = assertSafeId(
				ctx.getNodeParameter('documentId', i) as string,
				'Document ID',
			);
			const binaryPropertyName = ctx.getNodeParameter(
				'binaryPropertyName',
				i,
				'data',
			) as string;

			const response = (await docuSignRequest(
				ctx,
				'GET',
				`${basePath}/${documentId}`,
				undefined,
				undefined,
				{ encoding: null, json: false },
			)) as Buffer;

			const mimeType =
				documentId === 'archive' ? 'application/zip' : 'application/pdf';
			const extension = documentId === 'archive' ? 'zip' : 'pdf';
			const envelopeId = ctx.getNodeParameter('envelopeId', i) as string;
			const fileName = `document_${envelopeId}_${documentId}.${extension}`;

			const binaryData = await ctx.helpers.prepareBinaryData(
				response,
				fileName,
				mimeType,
			);

			return {
				json: { envelopeId, documentId, fileName },
				binary: { [binaryPropertyName]: binaryData },
			} as INodeExecutionData;
		}

		default:
			throw new Error(`Unsupported document operation: ${operation}`);
	}
}
