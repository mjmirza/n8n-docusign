import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, envelopePath } from '../../transport';

export async function handleEnvelopeEmailSetting(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	)}/email_settings`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'create':
		case 'update': {
			const body: IDataObject = {};
			const replyEmail = ctx.getNodeParameter('replyEmailAddressOverride', i, '') as string;
			const replyName = ctx.getNodeParameter('replyEmailNameOverride', i, '') as string;
			if (replyEmail) body.replyEmailAddressOverride = replyEmail;
			if (replyName) body.replyEmailNameOverride = replyName;

			const bccData = ctx.getNodeParameter('bccEmailAddresses', i, {}) as IDataObject;
			if (bccData.address) {
				body.bccEmailAddresses = (bccData.address as Array<{ email: string }>).map((a) => ({
					bccEmailAddressId: '',
					email: a.email,
				}));
			}

			const method = operation === 'create' ? 'POST' : 'PUT';
			return docuSignRequest(ctx, method, basePath, body);
		}

		case 'delete': {
			return docuSignRequest(ctx, 'DELETE', basePath);
		}

		default:
			throw new Error(`Unsupported envelope email setting operation: ${operation}`);
	}
}
