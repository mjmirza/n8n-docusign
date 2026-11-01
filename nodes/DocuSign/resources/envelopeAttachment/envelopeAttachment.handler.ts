import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';

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
			// Node version 1 keeps the response as JSON so saved workflows see the same output.
			if (ctx.getNode().typeVersion < 2) {
				return docuSignRequest(ctx, 'GET', `${basePath}/${attachmentId}`);
			}
			// Version 2: the endpoint returns the file itself (application/octet-stream), so return binary.
			const bytes = (await docuSignRequest(ctx, 'GET', `${basePath}/${attachmentId}`, undefined, undefined, {
				encoding: 'arraybuffer',
				json: false,
			})) as Buffer;
			const fileName = `attachment_${attachmentId}`;
			const binary = await ctx.helpers.prepareBinaryData(bytes, fileName, 'application/octet-stream');
			return { json: { attachmentId, fileName }, binary: { data: binary } } as INodeExecutionData;
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
