import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest } from '../../transport';

/**
 * Handle all Diagnostic Resource operations.
 * Global endpoint — no account prefix in the path.
 */
export async function handleDiagnosticResource(
	ctx: IExecuteFunctions,
	operation: string,
	_i: number,
): Promise<unknown> {
	switch (operation) {
		case 'get': {
			// GET /restapi/v2.1 lists the resources of the versioned API.
			return docuSignRequest(ctx, 'GET', '', undefined, undefined, { apiRoot: 'version' });
		}

		default:
			throw new Error(`Unsupported diagnostic resource operation: ${operation}`);
	}
}
