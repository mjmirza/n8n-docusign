import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';

/**
 * Handle all Account operations.
 */
export async function handleAccount(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	);

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'getBillingCharges': {
			return docuSignRequest(ctx, 'GET', `${basePath}/billing_charges`);
		}

		case 'getEnvelopePurgeConfiguration': {
			return docuSignRequest(ctx, 'GET', `${basePath}/settings/envelope_purge_configuration`);
		}

		case 'getNotificationDefaults': {
			return docuSignRequest(ctx, 'GET', `${basePath}/settings/notification_defaults`);
		}

		case 'listRecipientNamesByEmail': {
			const email = ctx.getNodeParameter('email', i) as string;
			// recipient_names exists only in the v2 API; the v2.1 spec dropped it.
			return docuSignRequest(ctx, 'GET', `${basePath}/recipient_names`, undefined, { email }, { apiRoot: 'v2' });
		}

		case 'listSettings': {
			return docuSignRequest(ctx, 'GET', `${basePath}/settings`);
		}

		case 'listSharedAccess': {
			return docuSignRequest(ctx, 'GET', `${basePath}/shared_access`);
		}

		case 'listSupportedLanguages': {
			return docuSignRequest(ctx, 'GET', `${basePath}/supported_languages`);
		}

		case 'listUnsupportedFileTypes': {
			return docuSignRequest(ctx, 'GET', `${basePath}/unsupported_file_types`);
		}

		case 'updateEnvelopePurgeConfiguration': {
			const body = JSON.parse(
				ctx.getNodeParameter('purgeConfiguration', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/settings/envelope_purge_configuration`, body);
		}

		case 'updateNotificationDefaults': {
			const body = JSON.parse(
				ctx.getNodeParameter('notificationDefaults', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/settings/notification_defaults`, body);
		}

		case 'updateSettings': {
			const body = JSON.parse(
				ctx.getNodeParameter('settings', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/settings`, body);
		}

		case 'updateSharedAccess': {
			const body = JSON.parse(
				ctx.getNodeParameter('sharedAccess', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/shared_access`, body);
		}

		default:
			throw new Error(`Unsupported account operation: ${operation}`);
	}
}
