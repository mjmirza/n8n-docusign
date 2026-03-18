import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Workspace operations.
 */
export async function handleWorkspace(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/workspaces`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const workspaceId = assertSafeId(
				ctx.getNodeParameter('workspaceId', i) as string,
				'Workspace ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${workspaceId}`);
		}

		case 'create': {
			const workspaceName = ctx.getNodeParameter('workspaceName', i) as string;
			const workspaceDescription = ctx.getNodeParameter('workspaceDescription', i, '') as string;
			const body: IDataObject = { workspaceName };
			if (workspaceDescription) {
				body.workspaceDescription = workspaceDescription;
			}
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const workspaceId = assertSafeId(
				ctx.getNodeParameter('workspaceId', i) as string,
				'Workspace ID',
			);
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new Error('Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'PUT', `${basePath}/${workspaceId}`, body);
		}

		case 'delete': {
			const workspaceId = assertSafeId(
				ctx.getNodeParameter('workspaceId', i) as string,
				'Workspace ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${workspaceId}`);
		}

		default:
			throw new Error(`Unsupported workspace operation: ${operation}`);
	}
}
