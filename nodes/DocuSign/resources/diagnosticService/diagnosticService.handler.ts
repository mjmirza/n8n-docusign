import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest } from '../../transport';

/**
 * Handle all Diagnostic Service operations.
 * Global endpoint — no account prefix in the path.
 */
export async function handleDiagnosticService(
	ctx: IExecuteFunctions,
	operation: string,
	_i: number,
): Promise<unknown> {
	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', 'service_information');
		}

		default:
			throw new Error(`Unsupported diagnostic service operation: ${operation}`);
	}
}
