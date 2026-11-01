import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, templatePath, lockEditOptions } from '../../transport';

export async function handleTemplateLock(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${templatePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('templateId', i) as string,
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
			const templatePassword = ctx.getNodeParameter('templatePassword', i, '') as string;
			const body: IDataObject = {
				lockDurationInSeconds: String(duration),
				lockType,
				lockedByApp,
				useScratchPad,
			};
			if (templatePassword) body.templatePassword = templatePassword;
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const duration = ctx.getNodeParameter('lockDurationInSeconds', i, 300) as number;
			const lockToken = ctx.getNodeParameter('lockToken', i, '') as string;
			const templatePassword = ctx.getNodeParameter('templatePassword', i, '') as string;
			const body: IDataObject = { lockDurationInSeconds: String(duration) };
			if (templatePassword) body.templatePassword = templatePassword;
			return docuSignRequest(ctx, 'PUT', basePath, body, undefined, lockEditOptions(lockToken, duration));
		}

		case 'delete': {
			const lockToken = ctx.getNodeParameter('lockToken', i, '') as string;
			const templatePassword = ctx.getNodeParameter('templatePassword', i, '') as string;
			const body: IDataObject = {};
			if (templatePassword) body.templatePassword = templatePassword;
			return docuSignRequest(ctx, 'DELETE', basePath, body, undefined, lockEditOptions(lockToken));
		}

		default:
			throw new Error(`Unsupported template lock operation: ${operation}`);
	}
}
