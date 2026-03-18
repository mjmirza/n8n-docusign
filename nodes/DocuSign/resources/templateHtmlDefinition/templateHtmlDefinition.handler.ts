import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, templatePath, assertSafeId } from '../../transport';

/**
 * Handle Template HTML Definition operations.
 */
export async function handleTemplateHtmlDefinition(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const tplPath = templatePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('templateId', i) as string,
	);

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', `${tplPath}/html_definitions`);
		}

		case 'listDocument': {
			const documentId = assertSafeId(
				ctx.getNodeParameter('documentId', i) as string,
				'Document ID',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${tplPath}/documents/${documentId}/html_definitions`,
			);
		}

		case 'createResponsiveHtml': {
			const body = ctx.getNodeParameter('requestBody', i, {}) as IDataObject;
			return docuSignRequest(
				ctx,
				'POST',
				`${tplPath}/responsive_html_preview`,
				body,
			);
		}

		case 'createDocResponsiveHtml': {
			const documentId = assertSafeId(
				ctx.getNodeParameter('documentId', i) as string,
				'Document ID',
			);
			const body = ctx.getNodeParameter('requestBody', i, {}) as IDataObject;
			return docuSignRequest(
				ctx,
				'POST',
				`${tplPath}/documents/${documentId}/responsive_html_preview`,
				body,
			);
		}

		default:
			throw new Error(`Unsupported template HTML definition operation: ${operation}`);
	}
}
