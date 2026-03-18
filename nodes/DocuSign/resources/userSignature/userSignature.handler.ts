import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

const VALID_IMAGE_TYPES = new Set(['signature_image', 'initials_image']);

/**
 * Handle all User Signature operations.
 */
export async function handleUserSignature(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const userId = assertSafeId(
		ctx.getNodeParameter('userId', i) as string,
		'User ID',
	);
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/users/${userId}/signatures`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const signatureId = assertSafeId(
				ctx.getNodeParameter('signatureId', i) as string,
				'Signature ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${signatureId}`);
		}

		case 'create': {
			const body = JSON.parse(
				ctx.getNodeParameter('signatureBody', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const signatureId = assertSafeId(
				ctx.getNodeParameter('signatureId', i) as string,
				'Signature ID',
			);
			const body = JSON.parse(
				ctx.getNodeParameter('updateBody', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/${signatureId}`, body);
		}

		case 'updateList': {
			const signatures = JSON.parse(
				ctx.getNodeParameter('signaturesBody', i) as string,
			);
			return docuSignRequest(ctx, 'PUT', basePath, { userSignatures: signatures } as unknown as IDataObject);
		}

		case 'delete': {
			const signatureId = assertSafeId(
				ctx.getNodeParameter('signatureId', i) as string,
				'Signature ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${signatureId}`);
		}

		case 'getImage': {
			const signatureId = assertSafeId(
				ctx.getNodeParameter('signatureId', i) as string,
				'Signature ID',
			);
			const imageType = ctx.getNodeParameter('imageType', i) as string;
			if (!VALID_IMAGE_TYPES.has(imageType)) {
				throw new Error('Invalid image type. Must be one of: signature_image, initials_image');
			}
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i, 'data') as string;

			const response = (await docuSignRequest(
				ctx,
				'GET',
				`${basePath}/${signatureId}/${imageType}`,
				undefined,
				undefined,
				{ encoding: null, json: false },
			)) as Buffer;

			const fileName = `signature_${signatureId}_${imageType}.png`;
			const binaryData = await ctx.helpers.prepareBinaryData(response, fileName, 'image/png');

			return {
				json: { signatureId, imageType, fileName },
				binary: { [binaryPropertyName]: binaryData },
			} as INodeExecutionData;
		}

		case 'updateImage': {
			const signatureId = assertSafeId(
				ctx.getNodeParameter('signatureId', i) as string,
				'Signature ID',
			);
			const imageType = ctx.getNodeParameter('imageType', i) as string;
			if (!VALID_IMAGE_TYPES.has(imageType)) {
				throw new Error('Invalid image type. Must be one of: signature_image, initials_image');
			}

			let fileBuffer: Buffer;
			const uploadSource = ctx.getNodeParameter('uploadSource', i, 'binary') as string;
			if (uploadSource === 'binary') {
				const binaryPropName = ctx.getNodeParameter('inputBinaryPropertyName', i, 'data') as string;
				const binaryData = ctx.helpers.assertBinaryData(i, binaryPropName);
				fileBuffer = await ctx.helpers.getBinaryDataBuffer(i, binaryPropName);
				void binaryData; // referenced for assertion
			} else {
				const base64 = ctx.getNodeParameter('base64Content', i) as string;
				fileBuffer = Buffer.from(base64, 'base64');
			}

			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/${signatureId}/${imageType}`,
				fileBuffer as unknown as IDataObject,
				undefined,
				{ contentType: 'image/png' },
			);
		}

		case 'deleteImage': {
			const signatureId = assertSafeId(
				ctx.getNodeParameter('signatureId', i) as string,
				'Signature ID',
			);
			const imageType = ctx.getNodeParameter('imageType', i) as string;
			if (!VALID_IMAGE_TYPES.has(imageType)) {
				throw new Error('Invalid image type. Must be one of: signature_image, initials_image');
			}
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${signatureId}/${imageType}`);
		}

		default:
			throw new Error(`Unsupported user signature operation: ${operation}`);
	}
}
