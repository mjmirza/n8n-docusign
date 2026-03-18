import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Account Consumer Disclosure operations.
 */
export async function handleAccountConsumerDisclosure(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/consumer_disclosure`;

	switch (operation) {
		case 'getDefault': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const langCode = assertSafeId(
				ctx.getNodeParameter('langCode', i) as string,
				'Language Code',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${langCode}`);
		}

		case 'update': {
			const langCode = assertSafeId(
				ctx.getNodeParameter('langCode', i) as string,
				'Language Code',
			);
			const body = JSON.parse(
				ctx.getNodeParameter('disclosureData', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/${langCode}`, body);
		}

		default:
			throw new Error(`Unsupported account consumer disclosure operation: ${operation}`);
	}
}
