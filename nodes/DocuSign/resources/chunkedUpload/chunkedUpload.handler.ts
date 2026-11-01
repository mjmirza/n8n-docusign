import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Chunked Upload operations.
 */
export async function handleChunkedUpload(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/chunked_uploads`;

	switch (operation) {
		case 'create': {
			let body: IDataObject;
			try {
				body = JSON.parse(
					ctx.getNodeParameter('requestBody', i) as string,
				) as IDataObject;
			} catch {
				throw new NodeOperationError(ctx.getNode(), 'Invalid JSON in request body');
			}
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'get': {
			const chunkedUploadId = assertSafeId(
				ctx.getNodeParameter('chunkedUploadId', i) as string,
				'Chunked Upload ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${chunkedUploadId}`);
		}

		case 'update': {
			const chunkedUploadId = assertSafeId(
				ctx.getNodeParameter('chunkedUploadId', i) as string,
				'Chunked Upload ID',
			);
			const chunkIndex = ctx.getNodeParameter('chunkIndex', i) as number;
			const inputDataSource = ctx.getNodeParameter('inputDataSource', i) as string;

			let binaryData: Buffer;
			if (inputDataSource === 'binaryProperty') {
				const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i) as string;
				const binaryItem = ctx.helpers.assertBinaryData(i, binaryPropertyName);
				binaryData = await ctx.helpers.getBinaryDataBuffer(i, binaryPropertyName);
				void binaryItem; // ensure binary exists
			} else {
				const base64String = ctx.getNodeParameter('base64Data', i) as string;
				binaryData = Buffer.from(base64String, 'base64');
			}

			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/${chunkedUploadId}/${chunkIndex}`,
				binaryData as unknown as IDataObject,
				undefined,
				{ encoding: null, json: false, contentType: 'application/octet-stream' },
			);
		}

		case 'commit': {
			const chunkedUploadId = assertSafeId(
				ctx.getNodeParameter('chunkedUploadId', i) as string,
				'Chunked Upload ID',
			);
			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/${chunkedUploadId}/commit`,
			);
		}

		case 'delete': {
			const chunkedUploadId = assertSafeId(
				ctx.getNodeParameter('chunkedUploadId', i) as string,
				'Chunked Upload ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${chunkedUploadId}`);
		}

		default:
			throw new Error(`Unsupported chunked upload operation: ${operation}`);
	}
}
