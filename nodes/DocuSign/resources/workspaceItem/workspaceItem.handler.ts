import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

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
			// DocuSign has no type filter; it takes include_files and include_sub_folders flags.
			if (filters.includeFiles !== undefined) qs.include_files = String(filters.includeFiles);
			if (filters.includeSubFolders !== undefined) qs.include_sub_folders = String(filters.includeSubFolders);
			if (filters.type === 'file' && qs.include_files === undefined) qs.include_files = 'true';
			if (filters.type === 'folder' && qs.include_sub_folders === undefined) qs.include_sub_folders = 'true';
			// GET .../workspaces/{workspaceId}/folders/{folderId} lists the folder's items.
			return docuSignRequest(ctx, 'GET', basePath, undefined, qs);
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
				fileBase64 = (await ctx.helpers.getBinaryDataBuffer(i, binaryPropertyName)).toString('base64');
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
				fileBase64 = (await ctx.helpers.getBinaryDataBuffer(i, binaryPropertyName)).toString('base64');
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
				items = parseJsonInput(
					ctx.getNodeParameter('itemsJson', i) as string,
				);
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in items');
			}

			// DocuSign's workspaceItem uses id and type; the older itemId and itemType keys are mapped.
			const list = Array.isArray(items) ? items : items && typeof items === 'object' ? [items] : [];
			const mapped = list.map((item) => {
				const { itemId, itemType, ...rest } = item as Record<string, unknown>;
				const out: Record<string, unknown> = { ...rest };
				if (out.id === undefined && itemId !== undefined) out.id = itemId;
				if (out.type === undefined && itemType !== undefined) out.type = itemType;
				if (out.id !== undefined) assertSafeId(String(out.id), 'Item ID');
				return out;
			});

			// DELETE on the folder URL with a workspaceItemList body.
			return docuSignRequest(ctx, 'DELETE', basePath, {
				items: mapped,
			} as unknown as IDataObject);
		}

		default:
			throw new Error(`Unsupported workspace item operation: ${operation}`);
	}
}
