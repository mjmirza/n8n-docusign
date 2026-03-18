import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Envelope Transfer Rule operations.
 */
export async function handleEnvelopeTransferRule(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(ctx.getNodeParameter('accountId', i) as string)}/envelopes/transfer_rules`;

	switch (operation) {
		case 'create': {
			const raw = ctx.getNodeParameter('requestBody', i) as string;
			let body: IDataObject;
			try {
				body = JSON.parse(raw) as IDataObject;
			} catch {
				throw new Error('Request body must be valid JSON');
			}
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'delete': {
			const ruleId = assertSafeId(
				ctx.getNodeParameter('ruleId', i) as string,
				'Rule ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${ruleId}`);
		}

		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'update': {
			const ruleId = assertSafeId(
				ctx.getNodeParameter('ruleId', i) as string,
				'Rule ID',
			);
			const raw = ctx.getNodeParameter('requestBody', i) as string;
			let body: IDataObject;
			try {
				body = JSON.parse(raw) as IDataObject;
			} catch {
				throw new Error('Request body must be valid JSON');
			}
			return docuSignRequest(ctx, 'PUT', `${basePath}/${ruleId}`, body);
		}

		case 'updateRule': {
			const raw = ctx.getNodeParameter('requestBody', i) as string;
			let body: IDataObject;
			try {
				body = JSON.parse(raw) as IDataObject;
			} catch {
				throw new Error('Request body must be valid JSON');
			}
			return docuSignRequest(ctx, 'PUT', basePath, body);
		}

		default:
			throw new Error(`Unsupported envelope transfer rule operation: ${operation}`);
	}
}
