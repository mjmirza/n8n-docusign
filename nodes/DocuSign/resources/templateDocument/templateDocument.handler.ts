import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, templatePath, assertSafeId } from '../../transport';

export async function handleTemplateDocument(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const tmplPath = templatePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('templateId', i) as string,
	);
	const basePath = `${tmplPath}/documents`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const documentId = assertSafeId(ctx.getNodeParameter('documentId', i) as string, 'Document ID');
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i, 'data') as string;

			const response = (await docuSignRequest(ctx, 'GET', `${basePath}/${documentId}`, undefined, undefined, { encoding: null, json: false })) as Buffer;
			const mimeType = documentId === 'archive' ? 'application/zip' : 'application/pdf';
			const extension = documentId === 'archive' ? 'zip' : 'pdf';
			const fileName = `template_doc_${documentId}.${extension}`;
			const binaryData = await ctx.helpers.prepareBinaryData(response, fileName, mimeType);

			return { json: { documentId, fileName }, binary: { [binaryPropertyName]: binaryData } } as INodeExecutionData;
		}

		case 'delete': {
			const documentId = assertSafeId(ctx.getNodeParameter('documentId', i) as string, 'Document ID');
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${documentId}`);
		}

		case 'update': {
			const documentId = assertSafeId(ctx.getNodeParameter('documentId', i) as string, 'Document ID');
			const docData = ctx.getNodeParameter('documentData', i, {}) as IDataObject;
			const content = (docData.content || [{}]) as IDataObject[];
			const doc = content[0] || {};

			if (doc.source === 'binary' && doc.binaryProperty) {
				const binaryData = ctx.helpers.assertBinaryData(i, doc.binaryProperty as string);
				return docuSignRequest(ctx, 'PUT', `${basePath}/${documentId}`, {
					documentBase64: binaryData.data,
					name: doc.name || binaryData.fileName || '',
					fileExtension: doc.fileExtension || 'pdf',
					documentId,
				});
			} else if (doc.documentBase64) {
				return docuSignRequest(ctx, 'PUT', `${basePath}/${documentId}`, {
					documentBase64: doc.documentBase64,
					name: doc.name || '',
					fileExtension: doc.fileExtension || 'pdf',
					documentId,
				});
			}

			throw new Error('Document content is required for update');
		}

		case 'updateList': {
			const docsJson = ctx.getNodeParameter('documentsJson', i, '[]') as string;
			let parsed: unknown;
			try { parsed = JSON.parse(docsJson); } catch { throw new NodeOperationError(ctx.getNode(), 'Documents must be valid JSON'); }
			return docuSignRequest(ctx, 'PUT', basePath, { documents: parsed } as IDataObject);
		}

		default:
			throw new Error(`Unsupported template document operation: ${operation}`);
	}
}
