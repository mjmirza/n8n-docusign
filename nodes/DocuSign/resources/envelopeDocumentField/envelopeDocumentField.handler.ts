import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';

export async function handleEnvelopeDocumentField(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const documentId = assertSafeId(
		ctx.getNodeParameter('documentId', i) as string,
		'Document ID',
	);
	const basePath = `${envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	)}/documents/${documentId}/fields`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'create': {
			const body = buildFieldBody(ctx, i);
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const body = buildFieldBody(ctx, i);
			return docuSignRequest(ctx, 'PUT', basePath, body);
		}

		case 'delete': {
			const body = buildFieldBody(ctx, i);
			return docuSignRequest(ctx, 'DELETE', basePath, body);
		}

		default:
			throw new Error(`Unsupported envelope document field operation: ${operation}`);
	}
}

function buildFieldBody(ctx: IExecuteFunctions, i: number): IDataObject {
	const fieldsData = ctx.getNodeParameter('documentFields', i, {}) as IDataObject;
	const entries = (fieldsData.field || []) as Array<{ name: string; value: string }>;
	return {
		documentFields: entries.map((f) => ({
			name: f.name,
			value: f.value || '',
		})),
	};
}
