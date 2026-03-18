import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';

/**
 * Handle all Envelope Consumer Disclosure operations.
 */
export async function handleEnvelopeConsumerDisclosure(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const envPath = envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	);
	const recipientId = assertSafeId(
		ctx.getNodeParameter('recipientId', i) as string,
		'Recipient ID',
	);

	switch (operation) {
		case 'get': {
			return docuSignRequest(
				ctx,
				'GET',
				`${envPath}/recipients/${recipientId}/consumer_disclosure`,
			);
		}

		case 'getDefault': {
			const langCode = assertSafeId(
				ctx.getNodeParameter('langCode', i) as string,
				'Language Code',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${envPath}/recipients/${recipientId}/consumer_disclosure/${langCode}`,
			);
		}

		default:
			throw new Error(`Unsupported envelope consumer disclosure operation: ${operation}`);
	}
}
