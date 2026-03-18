import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, templatePath } from '../../transport';

/**
 * Handle Template View operations.
 */
export async function handleTemplateView(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const tplPath = templatePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('templateId', i) as string,
	);

	switch (operation) {
		case 'createEdit': {
			const returnUrl = ctx.getNodeParameter('returnUrl', i) as string;
			const viewAccess = ctx.getNodeParameter('viewAccess', i, 'template') as string;
			const viewSettings = ctx.getNodeParameter('viewSettings', i, {}) as IDataObject;

			const body: IDataObject = { returnUrl };
			if (viewAccess) body.viewAccess = viewAccess;

			// Build settings object from non-empty values
			if (Object.keys(viewSettings).length > 0) {
				const settings: IDataObject = {};
				for (const [key, value] of Object.entries(viewSettings)) {
					if (value !== undefined && value !== '') {
						settings[key] = value;
					}
				}
				if (Object.keys(settings).length > 0) {
					body.settings = settings;
				}
			}

			return docuSignRequest(ctx, 'POST', `${tplPath}/views/edit`, body);
		}

		default:
			throw new Error(`Unsupported template view operation: ${operation}`);
	}
}
