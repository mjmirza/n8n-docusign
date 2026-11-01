import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, envelopePath } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

/**
 * Handle all Document Generation operations.
 */
export async function handleDocumentGeneration(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const envPath = envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	);

	switch (operation) {
		case 'getFormFields': {
			return docuSignRequest(ctx, 'GET', `${envPath}/docGenFormFields`);
		}

		case 'updateFormFields': {
			const raw = ctx.getNodeParameter('requestBody', i) as string;
			let body: IDataObject;
			try {
				body = parseJsonInput(raw) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Request body must be valid JSON');
			}
			return docuSignRequest(ctx, 'PUT', `${envPath}/docGenFormFields`, body);
		}

		default:
			throw new Error(`Unsupported document generation operation: ${operation}`);
	}
}
