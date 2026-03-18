import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';

/**
 * Handle all Identity Verification operations.
 */
export async function handleIdentityVerification(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/identity_verification`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		default:
			throw new Error(`Unsupported identity verification operation: ${operation}`);
	}
}
