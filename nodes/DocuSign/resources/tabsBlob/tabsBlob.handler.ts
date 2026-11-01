import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, envelopePath } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

/**
 * Handle all Tabs Blob operations.
 */
export async function handleTabsBlob(
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
			return docuSignRequest(ctx, 'GET', `${envPath}/tabs_blob`);
		}

		case 'update': {
			const raw = ctx.getNodeParameter('requestBody', i) as string;
			let body: IDataObject;
			try {
				body = parseJsonInput(raw) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Request body must be valid JSON');
			}
			return docuSignRequest(ctx, 'PUT', `${envPath}/tabs_blob`, body);
		}

		default:
			throw new Error(`Unsupported tabs blob operation: ${operation}`);
	}
}
