import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
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
			// Validate the IDs first so bad input still gets the usual message.
			assertSafeId(ctx.getNodeParameter('serviceId', i) as string, 'Service ID');
			assertSafeId(ctx.getNodeParameter('folderId', i) as string, 'Folder ID');
			assertSafeId(ctx.getNodeParameter('fileId', i) as string, 'File ID');
			// Neither eSignature v2.1 nor v2 has a cloud storage file download endpoint, only
			// folder listings. Kept for saved workflows; removed from the picker in 3.0.0.
			throw new NodeOperationError(
				ctx.getNode(),
				'DocuSign has no API to download a cloud storage file. Use List Files to read file details.',
				{ itemIndex: i },
			);
		}

		default:
			throw new Error(`Unsupported cloud storage operation: ${operation}`);
	}
}
