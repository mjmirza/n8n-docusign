/**
 * Binary data helpers for DocuSign document upload/download operations.
 * Handles multipart encoding, image processing, and chunked uploads.
 */
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest } from '../transport';
import { assertSafeId } from '../transport';

/**
 * Download a document from DocuSign and return as binary data.
 */
export async function downloadDocument(
	ctx: IExecuteFunctions,
	basePath: string,
	documentId: string,
	binaryPropertyName: string,
	itemIndex: number,
): Promise<{ json: IDataObject; binary: Record<string, unknown> }> {
	const response = (await docuSignRequest(
		ctx,
		'GET',
		`${basePath}/documents/${documentId}`,
		undefined,
		undefined,
		{ encoding: null, json: false },
	)) as Buffer;

	const isArchive = documentId === 'archive';
	const isCertificate = documentId === 'certificate';
	const mimeType = isArchive ? 'application/zip' : 'application/pdf';
	const extension = isArchive ? 'zip' : 'pdf';
	const prefix = isCertificate ? 'certificate' : 'document';
	const fileName = `${prefix}_${documentId}.${extension}`;

	const binaryData = await ctx.helpers.prepareBinaryData(
		response,
		fileName,
		mimeType,
	);

	return {
		json: { documentId, fileName, mimeType },
		binary: { [binaryPropertyName]: binaryData },
	};
}

/**
 * Upload an image (signature, initials, profile photo) to DocuSign.
 * Accepts binary data from a previous node or a Base64 string.
 */
export async function uploadImage(
	ctx: IExecuteFunctions,
	path: string,
	itemIndex: number,
	source: string,
	binaryProperty: string,
	base64Content: string,
): Promise<unknown> {
	let imageBase64: string;

	if (source === 'binary' && binaryProperty) {
		const binaryData = ctx.helpers.assertBinaryData(
			itemIndex,
			binaryProperty,
		);
		imageBase64 = binaryData.data;
	} else if (base64Content) {
		imageBase64 = base64Content;
	} else {
		throw new Error('No image content provided');
	}

	return docuSignRequest(ctx, 'PUT', path, {
		imageBase64,
	} as IDataObject);
}

/**
 * Download an image (signature, initials, profile photo) from DocuSign.
 */
export async function downloadImage(
	ctx: IExecuteFunctions,
	path: string,
	binaryPropertyName: string,
	fileName: string,
	itemIndex: number,
): Promise<{ json: IDataObject; binary: Record<string, unknown> }> {
	const response = (await docuSignRequest(
		ctx,
		'GET',
		path,
		undefined,
		undefined,
		{ encoding: null, json: false },
	)) as Buffer;

	const binaryData = await ctx.helpers.prepareBinaryData(
		response,
		fileName,
		'image/png',
	);

	return {
		json: { fileName },
		binary: { [binaryPropertyName]: binaryData },
	};
}

/**
 * Orchestrate a chunked upload for documents larger than 25 MB.
 *
 * DocuSign chunked upload flow:
 * 1. POST /chunked_uploads — initiate (returns chunkedUploadId)
 * 2. PUT /chunked_uploads/{id}/1 — upload chunk(s)
 * 3. PUT /chunked_uploads/{id}/commit — finalize
 */
export async function chunkedUpload(
	ctx: IExecuteFunctions,
	accountPath: string,
	data: Buffer,
	fileName: string,
	itemIndex: number,
): Promise<string> {
	const CHUNK_SIZE = 20 * 1024 * 1024; // 20 MB chunks
	const totalSize = data.length;
	const totalParts = Math.ceil(totalSize / CHUNK_SIZE);

	// Step 1: Initiate
	const initResponse = (await docuSignRequest(
		ctx,
		'POST',
		`${accountPath}/chunked_uploads`,
		{
			chunkedUploadId: '',
			data: data.subarray(0, Math.min(CHUNK_SIZE, totalSize)).toString('base64'),
		} as IDataObject,
	)) as { chunkedUploadId: string };

	const uploadId = assertSafeId(
		initResponse.chunkedUploadId,
		'Chunked Upload ID',
	);

	// Step 2: Upload remaining chunks
	for (let part = 1; part < totalParts; part++) {
		const start = part * CHUNK_SIZE;
		const end = Math.min(start + CHUNK_SIZE, totalSize);
		const chunk = data.subarray(start, end);

		await docuSignRequest(
			ctx,
			'PUT',
			`${accountPath}/chunked_uploads/${uploadId}/${part + 1}`,
			{
				data: chunk.toString('base64'),
			} as IDataObject,
		);
	}

	// Step 3: Commit
	await docuSignRequest(
		ctx,
		'PUT',
		`${accountPath}/chunked_uploads/${uploadId}/commit`,
	);

	return uploadId;
}
