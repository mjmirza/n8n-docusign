import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, envelopePath } from '../../transport';

/**
 * Handle all Envelope View operations.
 */
export async function handleEnvelopeView(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const envPath = envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	);
	const basePath = `${envPath}/views`;

	switch (operation) {
		case 'createRecipient': {
			const returnUrl = ctx.getNodeParameter('returnUrl', i) as string;
			const signerEmail = ctx.getNodeParameter('signerEmail', i) as string;
			const signerName = ctx.getNodeParameter('signerName', i) as string;
			const clientUserId = ctx.getNodeParameter('clientUserId', i) as string;
			const authMethod = ctx.getNodeParameter('authenticationMethod', i, 'none') as string;
			const opts = ctx.getNodeParameter('recipientViewOptions', i, {}) as IDataObject;

			const body: IDataObject = {
				returnUrl,
				email: signerEmail,
				userName: signerName,
				clientUserId,
				authenticationMethod: authMethod,
			};

			// Embedded signing session options
			if (opts.pingUrl) body.pingUrl = opts.pingUrl;
			if (opts.pingFrequency) body.pingFrequency = String(opts.pingFrequency);
			if (opts.frameAncestors) {
				body.frameAncestors = String(opts.frameAncestors).split(',').map((s: string) => s.trim());
			}
			if (opts.messageOrigins) {
				body.messageOrigins = String(opts.messageOrigins).split(',').map((s: string) => s.trim());
			}
			if (opts.recipientId) body.recipientId = opts.recipientId;
			if (opts.userId) body.userId = opts.userId;
			if (opts.assertionId) body.assertionId = opts.assertionId;
			if (opts.authenticationInstant) body.authenticationInstant = opts.authenticationInstant;
			if (opts.securityDomain) body.securityDomain = opts.securityDomain;
			if (opts.xFrameOptions) body.xFrameOptions = opts.xFrameOptions;
			if (opts.xFrameOptionsAllowFromUrl) body.xFrameOptionsAllowFromUrl = opts.xFrameOptionsAllowFromUrl;

			return docuSignRequest(ctx, 'POST', `${basePath}/recipient`, body);
		}

		case 'createSender': {
			const returnUrl = ctx.getNodeParameter('returnUrl', i) as string;
			return docuSignRequest(ctx, 'POST', `${basePath}/sender`, { returnUrl });
		}

		case 'createEdit': {
			const returnUrl = ctx.getNodeParameter('returnUrl', i) as string;
			return docuSignRequest(ctx, 'POST', `${basePath}/edit`, { returnUrl });
		}

		case 'createCorrect': {
			const returnUrl = ctx.getNodeParameter('returnUrl', i) as string;
			return docuSignRequest(ctx, 'POST', `${basePath}/correct`, { returnUrl });
		}

		case 'createConsole': {
			const returnUrl = ctx.getNodeParameter('returnUrl', i) as string;
			const options = ctx.getNodeParameter('viewOptions', i, {}) as IDataObject;
			const body: IDataObject = { returnUrl };
			if (options.envelopeId) body.envelopeId = options.envelopeId;
			return docuSignRequest(ctx, 'POST', `${basePath}/console`, body);
		}

		case 'createSharedRecipient': {
			const returnUrl = ctx.getNodeParameter('returnUrl', i) as string;
			const signerEmail = ctx.getNodeParameter('signerEmail', i) as string;
			const signerName = ctx.getNodeParameter('signerName', i) as string;

			return docuSignRequest(ctx, 'POST', `${basePath}/shared`, {
				returnUrl,
				email: signerEmail,
				userName: signerName,
			});
		}

		case 'deleteCorrectView': {
			return docuSignRequest(ctx, 'DELETE', `${basePath}/correct`);
		}

		default:
			throw new Error(`Unsupported envelope view operation: ${operation}`);
	}
}
