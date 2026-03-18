import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Workspace Item operations.
 */
export async function handleWorkspaceItem(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const accountId = ctx.getNodeParameter('accountId', i) as string;
	const workspaceId = assertSafeId(
		ctx.getNodeParameter('workspaceId', i) as string,
		'Workspace ID',
	);
	const folderId = assertSafeId(
		ctx.getNodeParameter('folderId', i) as string,
		'Folder ID',
	);
	const basePath = `${accountPath(accountId)}/workspaces/${workspaceId}/folders/${folderId}`;

	switch (operation) {
		case 'listFolderItems': {
			const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = {};
			if (filters.count !== undefined) qs.count = filters.count;
			if (filters.start_position !== undefined) qs.start_position = filters.start_position;
			if (filters.type) qs.type = filters.type;
			return docuSignRequest(ctx, 'GET', `${basePath}/items`, undefined, qs);
		}

		case 'getFile': {
			const fileId = assertSafeId(
				ctx.getNodeParameter('fileId', i) as string,
				'File ID',
			);
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i, 'data') as string;

			const response = (await docuSignRequest(
				ctx,
				'GET',
				`${basePath}/files/${fileId}`,
				undefined,
				undefined,
				{ encoding: null, json: false },
			)) as Buffer;

			const fileName = `workspace_file_${fileId}`;
			const binaryData = await ctx.helpers.prepareBinaryData(response, fileName, 'application/octet-stream');

			return {
				json: { fileId, workspaceId, folderId, fileName },
				binary: { [binaryPropertyName]: binaryData },
			} as INodeExecutionData;
		}

		case 'createFile': {
			const uploadSource = ctx.getNodeParameter('uploadSource', i) as string;
			let fileBase64: string;
			let fileName = 'upload';

			if (uploadSource === 'binary') {
				const binaryPropertyName = ctx.getNodeParameter('inputBinaryPropertyName', i, 'data') as string;
				const binaryData = ctx.helpers.assertBinaryData(i, binaryPropertyName);
				fileBase64 = binaryData.data;
				fileName = binaryData.fileName || 'upload';
			} else {
				fileBase64 = ctx.getNodeParameter('base64Content', i) as string;
			}

			return docuSignRequest(ctx, 'POST', `${basePath}/files`, {
				fileBase64,
				name: fileName,
			} as IDataObject);
		}

		case 'updateFile': {
			const fileId = assertSafeId(
				ctx.getNodeParameter('fileId', i) as string,
				'File ID',
			);
			const uploadSource = ctx.getNodeParameter('uploadSource', i) as string;
			let fileBase64: string;
			let fileName = 'upload';

			if (uploadSource === 'binary') {
				const binaryPropertyName = ctx.getNodeParameter('inputBinaryPropertyName', i, 'data') as string;
				const binaryData = ctx.helpers.assertBinaryData(i, binaryPropertyName);
				fileBase64 = binaryData.data;
				fileName = binaryData.fileName || 'upload';
			} else {
				fileBase64 = ctx.getNodeParameter('base64Content', i) as string;
			}

			return docuSignRequest(ctx, 'PUT', `${basePath}/files/${fileId}`, {
				fileBase64,
				name: fileName,
			} as IDataObject);
		}

		case 'listFilePages': {
			const fileId = assertSafeId(
				ctx.getNodeParameter('fileId', i) as string,
				'File ID',
			);
			const pageFilters = ctx.getNodeParameter('pageFilters', i, {}) as IDataObject;
			const qs: IDataObject = {};
			if (pageFilters.count !== undefined) qs.count = pageFilters.count;
			if (pageFilters.start_position !== undefined) qs.start_position = pageFilters.start_position;
			return docuSignRequest(ctx, 'GET', `${basePath}/files/${fileId}/pages`, undefined, qs);
		}

		case 'deleteFolderItems': {
			let items: unknown;
			try {
				items = JSON.parse(
					ctx.getNodeParameter('itemsJson', i) as string,
				);
			} catch {
				throw new Error('Invalid JSON in items');
			}

			// Validate itemIds
			if (Array.isArray(items)) {
				for (const item of items) {
					const obj = item as Record<string, unknown>;
					if (obj.itemId) {
						assertSafeId(obj.itemId as string, 'Item ID');
					}
				}
			}

			return docuSignRequest(ctx, 'DELETE', `${basePath}/items`, {
				items,
			} as unknown as IDataObject);
		}

		default:
			throw new Error(`Unsupported workspace item operation: ${operation}`);
	}
}
