import type { IExecuteFunctions } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Cloud Storage operations.
 */
export async function handleCloudStorage(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const acctPath = accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	);
	const userId = assertSafeId(
		ctx.getNodeParameter('userId', i) as string,
		'User ID',
	);
	const userCloudPath = `${acctPath}/users/${userId}/cloud_storage`;

	switch (operation) {
		case 'listProviders': {
			return docuSignRequest(ctx, 'GET', userCloudPath);
		}

		case 'listFolders': {
			const serviceId = assertSafeId(
				ctx.getNodeParameter('serviceId', i) as string,
				'Service ID',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${userCloudPath}/${serviceId}/folders`,
			);
		}

		case 'listFiles': {
			const serviceId = assertSafeId(
				ctx.getNodeParameter('serviceId', i) as string,
				'Service ID',
			);
			const folderId = assertSafeId(
				ctx.getNodeParameter('folderId', i) as string,
				'Folder ID',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${userCloudPath}/${serviceId}/folders/${folderId}`,
			);
		}

		case 'getFile': {
			const serviceId = assertSafeId(
				ctx.getNodeParameter('serviceId', i) as string,
				'Service ID',
			);
			const folderId = assertSafeId(
				ctx.getNodeParameter('folderId', i) as string,
				'Folder ID',
			);
			const fileId = assertSafeId(
				ctx.getNodeParameter('fileId', i) as string,
				'File ID',
			);
			const binaryPropertyName = ctx.getNodeParameter(
				'binaryPropertyName',
				i,
				'data',
			) as string;

			const response = await docuSignRequest(
				ctx,
				'GET',
				`${userCloudPath}/${serviceId}/folders/${folderId}/files/${fileId}`,
				undefined,
				undefined,
				{ encoding: null, json: false },
			);

			const binaryData = await ctx.helpers.prepareBinaryData(
				Buffer.isBuffer(response) ? response : Buffer.from(response as string),
				`cloud_storage_file_${fileId}`,
			);

			return {
				json: { fileId, serviceId, folderId },
				binary: { [binaryPropertyName]: binaryData },
			};
		}

		default:
			throw new Error(`Unsupported cloud storage operation: ${operation}`);
	}
}
