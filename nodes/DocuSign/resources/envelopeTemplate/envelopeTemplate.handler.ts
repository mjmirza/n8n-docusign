import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';

export async function handleEnvelopeTemplate(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const envPath = envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	);

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', `${envPath}/templates`);
		}

		case 'apply': {
			const templateId = assertSafeId(
				ctx.getNodeParameter('templateId', i) as string,
				'Template ID',
			);
			return docuSignRequest(ctx, 'POST', `${envPath}/templates`, {
				documentTemplates: [{ templateId }],
			});
		}

		case 'applyToDocument': {
			const templateId = assertSafeId(
				ctx.getNodeParameter('templateId', i) as string,
				'Template ID',
			);
			const documentId = assertSafeId(
				ctx.getNodeParameter('documentId', i) as string,
				'Document ID',
			);
			return docuSignRequest(
				ctx,
				'POST',
				`${envPath}/documents/${documentId}/templates`,
				{ documentTemplates: [{ templateId }] },
			);
		}

		case 'delete': {
			const templateId = assertSafeId(
				ctx.getNodeParameter('templateId', i) as string,
				'Template ID',
			);
			const documentId = assertSafeId(
				ctx.getNodeParameter('documentId', i) as string,
				'Document ID',
			);
			// Templates are removed per document: DELETE .../documents/{documentId}/templates/{templateId}.
			return docuSignRequest(
				ctx,
				'DELETE',
				`${envPath}/documents/${documentId}/templates/${templateId}`,
			);
		}

		case 'listByDocument': {
			const documentId = assertSafeId(
				ctx.getNodeParameter('documentId', i) as string,
				'Document ID',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${envPath}/documents/${documentId}/templates`,
			);
		}

		default:
			throw new Error(`Unsupported envelope template operation: ${operation}`);
	}
}
