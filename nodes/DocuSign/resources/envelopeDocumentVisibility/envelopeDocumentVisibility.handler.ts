import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';

export async function handleEnvelopeDocumentVisibility(
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
			const recipientId = assertSafeId(
				ctx.getNodeParameter('recipientId', i) as string,
				'Recipient ID',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${envPath}/recipients/${recipientId}/document_visibility`,
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
				parsed = JSON.parse(visibility);
			} catch {
				throw new Error('Document visibility must be valid JSON');
			}
			return docuSignRequest(
				ctx,
				'PUT',
				`${envPath}/recipients/${recipientId}/document_visibility`,
				{ documentVisibility: parsed } as IDataObject,
			);
		}

		case 'updateAll': {
			const visibility = ctx.getNodeParameter('documentVisibility', i, '[]') as string;
			let parsed: unknown[];
			try {
				parsed = JSON.parse(visibility);
			} catch {
				throw new Error('Document visibility must be valid JSON');
			}
			return docuSignRequest(
				ctx,
				'PUT',
				`${envPath}/recipients/document_visibility`,
				{ documentVisibility: parsed } as IDataObject,
			);
		}

		default:
			throw new Error(`Unsupported envelope document visibility operation: ${operation}`);
	}
}
