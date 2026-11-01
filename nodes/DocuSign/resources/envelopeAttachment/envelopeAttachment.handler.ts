import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';

/** 3.0.0 version 1 output: a JSON body as-is, anything else as text under data. */
function legacyJson(bytes: Buffer): IDataObject {
	const text = bytes.toString('utf8');
	try {
		const parsed: unknown = JSON.parse(text);
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as IDataObject;
	} catch {
		// Not JSON: 3.0.0 passed the body through as text.
	}
	return { data: text };
}

export async function handleEnvelopeAttachment(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	)}/attachments`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'get': {
			const attachmentId = assertSafeId(
				ctx.getNodeParameter('attachmentId', i) as string,
				'Attachment ID',
			);
			// Every node version returns binary, as 2.1.0 did: the endpoint serves the file (application/octet-stream).
			const raw = (await docuSignRequest(ctx, 'GET', `${basePath}/${attachmentId}`, undefined, undefined, {
				encoding: 'arraybuffer',
				json: false,
			})) as unknown;
			// The transport returns a Buffer; anything else (a parsed JSON body) is serialised back to bytes.
			const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from(typeof raw === 'string' ? raw : JSON.stringify(raw ?? ''));
			const fileName = `attachment_${attachmentId}`;
			const binary = await ctx.helpers.prepareBinaryData(bytes, fileName, 'application/octet-stream');
			const json: IDataObject = { attachmentId, fileName };
			// Version 1 also keeps 3.0.0's JSON fields, so workflows built on 2.1.0 or 3.0.0 both still work.
			if (ctx.getNode().typeVersion < 2) Object.assign(json, legacyJson(bytes), { attachmentId, fileName });
			return { json, binary: { data: binary } } as INodeExecutionData;
		}

		case 'create': {
			const name = ctx.getNodeParameter('attachmentName', i) as string;
			const attachmentType = ctx.getNodeParameter('attachmentType', i) as string;
			const source = ctx.getNodeParameter('source', i) as string;

			let data: string;
			if (source === 'binary') {
				const binaryProp = ctx.getNodeParameter('binaryProperty', i, 'data') as string;
				ctx.helpers.assertBinaryData(i, binaryProp);
				data = (await ctx.helpers.getBinaryDataBuffer(i, binaryProp)).toString('base64');
			} else {
				data = ctx.getNodeParameter('base64Content', i) as string;
			}

			const accessControl = ctx.getNodeParameter('accessControl', i, 'senderAndAllRecipients') as string;
			const label = ctx.getNodeParameter('label', i, '') as string;
			const remoteUrl = ctx.getNodeParameter('remoteUrl', i, '') as string;

			const attachment: IDataObject = {
				name,
				attachmentType,
				accessControl,
			};

			if (data) attachment.data = data;
			if (label) attachment.label = label;
			if (remoteUrl) attachment.remoteUrl = remoteUrl;

			// With an Attachment ID to Replace, PUT .../attachments/{attachmentId} updates that one.
			const replaceId = ctx.getNodeParameter('replaceAttachmentId', i, '') as string;
			if (replaceId) {
				const attachmentId = assertSafeId(replaceId, 'Attachment ID');
				return docuSignRequest(ctx, 'PUT', `${basePath}/${attachmentId}`, { ...attachment, attachmentId });
			}

			return docuSignRequest(ctx, 'PUT', basePath, {
				attachments: [attachment],
			});
		}

		case 'delete': {
			const attachmentId = assertSafeId(
				ctx.getNodeParameter('attachmentId', i) as string,
				'Attachment ID',
			);
			// Attachments are deleted as a list: DELETE .../attachments with the IDs in the body.
			return docuSignRequest(ctx, 'DELETE', basePath, { attachments: [{ attachmentId }] });
		}

		default:
			throw new Error(`Unsupported envelope attachment operation: ${operation}`);
	}
}
