import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';

/**
 * Handle all Envelope HTML Definition operations.
 */
export async function handleEnvelopeHtmlDefinition(
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
			return docuSignRequest(ctx, 'GET', `${envPath}/html_definitions`);
		}

		case 'getDocument': {
			const documentId = assertSafeId(
				ctx.getNodeParameter('documentId', i) as string,
				'Document ID',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${envPath}/documents/${documentId}/html_definitions`,
			);
		}

		default:
			throw new Error(`Unsupported envelope HTML definition operation: ${operation}`);
	}
}
