import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

/**
 * Handle all Responsive HTML Preview operations.
 */
export async function handleResponsiveHtmlPreview(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const envPath = envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	);

	const raw = ctx.getNodeParameter('requestBody', i) as string;
	let body: IDataObject;
	try {
		body = parseJsonInput(raw) as IDataObject;
	} catch {
		throw new NodeOperationError(ctx.getNode(), 'Request body must be valid JSON');
	}

	switch (operation) {
		case 'createEnvelopePreview': {
			return docuSignRequest(ctx, 'POST', `${envPath}/responsive_html_preview`, body);
		}

		case 'createDocumentPreview': {
			const documentId = assertSafeId(
				ctx.getNodeParameter('documentId', i) as string,
				'Document ID',
			);
			return docuSignRequest(
				ctx,
				'POST',
				`${envPath}/documents/${documentId}/responsive_html_preview`,
				body,
			);
		}

		default:
			throw new Error(`Unsupported responsive HTML preview operation: ${operation}`);
	}
}
