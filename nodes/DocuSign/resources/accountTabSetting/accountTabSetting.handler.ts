import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';

/**
 * Handle all Account Tab Setting operations.
 */
export async function handleAccountTabSetting(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/settings/tabs`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'update': {
			// tabAccountSettings has no confirmInitialEnvelopeSend or enableAutoStamp; older saved values are left out.
			const { confirmInitialEnvelopeSend, enableAutoStamp, ...tabSettings } = ctx.getNodeParameter('tabSettings', i, {}) as IDataObject;
			void confirmInitialEnvelopeSend;
			void enableAutoStamp;
			return docuSignRequest(ctx, 'PUT', basePath, tabSettings);
		}

		default:
			throw new Error(`Unsupported account tab setting operation: ${operation}`);
	}
}
