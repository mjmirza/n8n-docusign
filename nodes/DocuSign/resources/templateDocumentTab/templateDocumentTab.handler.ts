import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, templatePath, assertSafeId } from '../../transport';

export async function handleTemplateDocumentTab(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const documentId = assertSafeId(
		ctx.getNodeParameter('documentId', i) as string,
		'Document ID',
	);
	const basePath = `${templatePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('templateId', i) as string,
	)}/documents/${documentId}/tabs`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'getByPage': {
			const pageNumber = assertSafeId(
				ctx.getNodeParameter('pageNumber', i) as string,
				'Page Number',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${templatePath(
					ctx.getNodeParameter('accountId', i) as string,
					ctx.getNodeParameter('templateId', i) as string,
				)}/documents/${documentId}/pages/${pageNumber}/tabs`,
			);
		}

		case 'create': {
			const body = ctx.getNodeParameter('requestBody', i, {}) as IDataObject;
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const body = ctx.getNodeParameter('requestBody', i, {}) as IDataObject;
			return docuSignRequest(ctx, 'PUT', basePath, body);
		}

		case 'delete': {
			const body = ctx.getNodeParameter('requestBody', i, {}) as IDataObject;
			return docuSignRequest(ctx, 'DELETE', basePath, body);
		}

		default:
			throw new Error(`Unsupported template document tab operation: ${operation}`);
	}
}
