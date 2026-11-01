import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, envelopePath, lockEditOptions } from '../../transport';

export async function handleEnvelopeLock(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	)}/lock`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'create': {
			const duration = ctx.getNodeParameter('lockDurationInSeconds', i, 300) as number;
			const lockType = ctx.getNodeParameter('lockType', i, 'edit') as string;
			const lockedByApp = ctx.getNodeParameter('lockedByApp', i, 'n8n') as string;
			const useScratchPad = ctx.getNodeParameter('useScratchPad', i, 'false') as string;
			return docuSignRequest(ctx, 'POST', basePath, {
				lockDurationInSeconds: String(duration),
				lockType,
				lockedByApp,
				useScratchPad,
			});
		}

		case 'update': {
			const duration = ctx.getNodeParameter('lockDurationInSeconds', i, 300) as number;
			const lockToken = ctx.getNodeParameter('lockToken', i, '') as string;
			const body: IDataObject = { lockDurationInSeconds: String(duration) };
			return docuSignRequest(ctx, 'PUT', basePath, body, undefined, lockEditOptions(lockToken, duration));
		}

		case 'delete': {
			const lockToken = ctx.getNodeParameter('lockToken', i, '') as string;
			const body: IDataObject = {};
			return docuSignRequest(ctx, 'DELETE', basePath, body, undefined, lockEditOptions(lockToken));
		}

		default:
			throw new Error(`Unsupported envelope lock operation: ${operation}`);
	}
}
