import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath } from '../../transport';

/**
 * Handle all eNote Configuration operations.
 */
export async function handleENoteConfiguration(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/settings/enote_configuration`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'delete': {
			return docuSignRequest(ctx, 'DELETE', basePath);
		}

		case 'update': {
			const body: IDataObject = {};
			const connectConfigured = ctx.getNodeParameter('connectConfigured', i, '') as string;
			if (connectConfigured !== '') {
				body.connectConfigured = connectConfigured;
			}
			const eNoteEnabled = ctx.getNodeParameter('eNoteEnabled', i, '') as string;
			if (eNoteEnabled !== '') {
				// eNoteConfiguration names this flag eNoteConfigured.
				body.eNoteConfigured = eNoteEnabled;
			}
			const organization = ctx.getNodeParameter('organization', i, '') as string;
			if (organization) {
				body.organization = organization;
			}
			const password = ctx.getNodeParameter('password', i, '') as string;
			if (password) {
				body.password = password;
			}
			const userName = ctx.getNodeParameter('eNoteUserName', i, '') as string;
			if (userName) {
				body.userName = userName;
			}
			return docuSignRequest(ctx, 'PUT', basePath, body);
		}

		default:
			throw new Error(`Unsupported eNote configuration operation: ${operation}`);
	}
}
