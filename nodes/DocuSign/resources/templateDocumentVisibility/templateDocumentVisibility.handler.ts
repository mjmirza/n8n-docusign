import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, templatePath, assertSafeId } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

export async function handleTemplateDocumentVisibility(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const tplPath = templatePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('templateId', i) as string,
	);

	switch (operation) {
		case 'get': {
			const recipientId = assertSafeId(
				ctx.getNodeParameter('recipientId', i) as string,
				'Recipient ID',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${tplPath}/recipients/${recipientId}/document_visibility`,
			);
		}

		case 'update': {
			const recipientId = assertSafeId(
				ctx.getNodeParameter('recipientId', i) as string,
				'Recipient ID',
			);
			const visibility = ctx.getNodeParameter('documentVisibility', i, '[]') as string;
			let parsed: unknown[];
			try {
				parsed = parseJsonInput(visibility);
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Document visibility must be valid JSON');
			}
			return docuSignRequest(
				ctx,
				'PUT',
				`${tplPath}/recipients/${recipientId}/document_visibility`,
				{ documentVisibility: parsed } as IDataObject,
			);
		}

		case 'updateList': {
			const visibility = ctx.getNodeParameter('documentVisibility', i, '[]') as string;
			let parsed: unknown[];
			try {
				parsed = parseJsonInput(visibility);
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Document visibility must be valid JSON');
			}
			return docuSignRequest(
				ctx,
				'PUT',
				`${tplPath}/recipients/document_visibility`,
				{ documentVisibility: parsed } as IDataObject,
			);
		}

		default:
			throw new Error(`Unsupported template document visibility operation: ${operation}`);
	}
}
