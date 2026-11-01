import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

const VALID_LOGO_TYPES = new Set(['primary', 'secondary', 'email']);
const VALID_RESOURCE_TYPES = new Set(['sending', 'signing', 'email', 'signing_captive']);

const CRLF = String.fromCharCode(13, 10);

/** A file name safe inside a quoted header value: no quotes, backslashes or control characters. */
function safeFileName(name: string | undefined, fallback: string): string {
	const cleaned = [...(name ?? '')]
		.filter((c) => c.charCodeAt(0) >= 32 && c !== '"' && c.charCodeAt(0) !== 92)
		.join('')
		.trim();
	return cleaned || fallback;
}

/** A single-part multipart/form-data body. */
function multipartFile(field: string, fileName: string, mimeType: string, data: Buffer): { body: Buffer; contentType: string } {
	const boundary = `----n8nDocuSign${Date.now().toString(16)}`;
	const head = [`--${boundary}`, `Content-Disposition: form-data; name="${field}"; filename="${fileName}"`, `Content-Type: ${mimeType}`, '', ''].join(CRLF);
	const body = Buffer.concat([Buffer.from(head), data, Buffer.from(`${CRLF}--${boundary}--${CRLF}`)]);
	return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

/**
 * Handle all Account Brand operations.
 */
export async function handleAccountBrand(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/brands`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${brandId}`);
		}

		case 'create': {
			const body: IDataObject = {
				brandName: ctx.getNodeParameter('brandName', i) as string,
				defaultBrandLanguage: ctx.getNodeParameter('defaultBrandLanguage', i, 'en') as string,
			};
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
			if (additionalFields.brandCompany) {
				body.brandCompany = additionalFields.brandCompany;
			}
			if (additionalFields.colors) {
				body.colors = JSON.parse(additionalFields.colors as string);
			}
			if (additionalFields.logos) {
				body.logos = JSON.parse(additionalFields.logos as string);
			}
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			const body: IDataObject = {};
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
			if (additionalFields.brandCompany) {
				body.brandCompany = additionalFields.brandCompany;
			}
			if (additionalFields.colors) {
				body.colors = JSON.parse(additionalFields.colors as string);
			}
			if (additionalFields.logos) {
				body.logos = JSON.parse(additionalFields.logos as string);
			}
			return docuSignRequest(ctx, 'PUT', `${basePath}/${brandId}`, body);
		}

		case 'delete': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${brandId}`);
		}

		case 'deleteList': {
			const brandIdsStr = ctx.getNodeParameter('brandIds', i) as string;
			const brands = brandIdsStr.split(',').map((id) => ({
				brandId: assertSafeId(id.trim(), 'Brand ID'),
			}));
			return docuSignRequest(ctx, 'DELETE', basePath, { brands } as unknown as IDataObject);
		}

		case 'getLogo': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			const logoType = ctx.getNodeParameter('logoType', i) as string;
			if (!VALID_LOGO_TYPES.has(logoType)) {
				throw new Error('Invalid logo type. Must be one of: primary, secondary, email');
			}
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i, 'data') as string;

			const response = (await docuSignRequest(
				ctx,
				'GET',
				`${basePath}/${brandId}/logos/${logoType}`,
				undefined,
				undefined,
				{ encoding: null, json: false },
			)) as Buffer;

			const fileName = `brand_${brandId}_logo_${logoType}.png`;
			const binaryData = await ctx.helpers.prepareBinaryData(response, fileName, 'image/png');

			return {
				json: { brandId, logoType, fileName },
				binary: { [binaryPropertyName]: binaryData },
			} as INodeExecutionData;
		}

		case 'deleteLogo': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			const logoType = ctx.getNodeParameter('logoType', i) as string;
			if (!VALID_LOGO_TYPES.has(logoType)) {
				throw new Error('Invalid logo type. Must be one of: primary, secondary, email');
			}
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${brandId}/logos/${logoType}`);
		}

		case 'updateLogo': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			const logoType = ctx.getNodeParameter('logoType', i) as string;
			if (!VALID_LOGO_TYPES.has(logoType)) {
				throw new Error('Invalid logo type. Must be one of: primary, secondary, email');
			}

			let fileBuffer: Buffer;
			let uploadName: string | undefined;
			const uploadSource = ctx.getNodeParameter('uploadSource', i, 'binary') as string;
			if (uploadSource === 'binary') {
				const binaryPropName = ctx.getNodeParameter('inputBinaryPropertyName', i, 'data') as string;
				const binaryData = ctx.helpers.assertBinaryData(i, binaryPropName);
				fileBuffer = await ctx.helpers.getBinaryDataBuffer(i, binaryPropName);
				uploadName = binaryData.fileName;
			} else {
				const base64 = ctx.getNodeParameter('base64Content', i) as string;
				fileBuffer = Buffer.from(base64, 'base64');
			}

			// The spec passes the logo's file name in Content-Disposition next to the raw image bytes.
			const logoName = safeFileName(uploadName, `logo_${logoType}.png`);
			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/${brandId}/logos/${logoType}`,
				fileBuffer as unknown as IDataObject,
				undefined,
				{
					contentType: 'image/png',
					headers: { 'Content-Disposition': `form-data; name="file"; filename="${logoName}"` },
				},
			);
		}

		case 'getResource': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			const resourceContentType = ctx.getNodeParameter('resourceContentType', i) as string;
			if (!VALID_RESOURCE_TYPES.has(resourceContentType)) {
				throw new Error('Invalid resource content type. Must be one of: sending, signing, email, signing_captive');
			}
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i, 'data') as string;

			const response = (await docuSignRequest(
				ctx,
				'GET',
				`${basePath}/${brandId}/resources/${resourceContentType}`,
				undefined,
				undefined,
				{ encoding: null, json: false },
			)) as Buffer;

			const fileName = `brand_${brandId}_resource_${resourceContentType}.xml`;
			const binaryData = await ctx.helpers.prepareBinaryData(response, fileName, 'application/xml');

			return {
				json: { brandId, resourceContentType, fileName },
				binary: { [binaryPropertyName]: binaryData },
			} as INodeExecutionData;
		}

		case 'updateResource': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			const resourceContentType = ctx.getNodeParameter('resourceContentType', i) as string;
			if (!VALID_RESOURCE_TYPES.has(resourceContentType)) {
				throw new Error('Invalid resource content type. Must be one of: sending, signing, email, signing_captive');
			}

			let fileBuffer: Buffer;
			let uploadName: string | undefined;
			const uploadSource = ctx.getNodeParameter('uploadSource', i, 'binary') as string;
			if (uploadSource === 'binary') {
				const binaryPropName = ctx.getNodeParameter('inputBinaryPropertyName', i, 'data') as string;
				const binaryData = ctx.helpers.assertBinaryData(i, binaryPropName);
				fileBuffer = await ctx.helpers.getBinaryDataBuffer(i, binaryPropName);
				uploadName = binaryData.fileName;
			} else {
				const base64 = ctx.getNodeParameter('base64Content', i) as string;
				fileBuffer = Buffer.from(base64, 'base64');
			}

			// The spec takes the resource as a multipart/form-data part named file.xml.
			const resourceName = safeFileName(uploadName, `${resourceContentType}.xml`);
			const { body, contentType } = multipartFile('file.xml', resourceName, 'application/xml', fileBuffer);
			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/${brandId}/resources/${resourceContentType}`,
				body as unknown as IDataObject,
				undefined,
				{ contentType },
			);
		}

		case 'listResources': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${brandId}/resources`);
		}

		case 'getExportFile': {
			const brandId = assertSafeId(
				ctx.getNodeParameter('brandId', i) as string,
				'Brand ID',
			);
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i, 'data') as string;

			const response = (await docuSignRequest(
				ctx,
				'GET',
				`${basePath}/${brandId}/file`,
				undefined,
				undefined,
				{ encoding: null, json: false },
			)) as Buffer;

			const fileName = `brand_${brandId}_export.xml`;
			const binaryData = await ctx.helpers.prepareBinaryData(response, fileName, 'application/xml');

			return {
				json: { brandId, fileName },
				binary: { [binaryPropertyName]: binaryData },
			} as INodeExecutionData;
		}

		default:
			throw new Error(`Unsupported account brand operation: ${operation}`);
	}
}
