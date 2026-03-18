import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, templatePath, assertSafeId } from '../../transport';

const VALID_RECIPIENT_TYPES = new Set([
	'signers', 'carbonCopies', 'certifiedDeliveries', 'inPersonSigners',
	'agents', 'editors', 'intermediaries', 'witnesses', 'notaries', 'seals',
]);

function assertValidRecipientType(value: string): string {
	if (!VALID_RECIPIENT_TYPES.has(value)) {
		throw new Error(`Invalid recipient type. Must be one of: ${[...VALID_RECIPIENT_TYPES].join(', ')}`);
	}
	return value;
}

export async function handleTemplateRecipient(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${templatePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('templateId', i) as string,
	)}/recipients`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'create': {
			const recipientType = assertValidRecipientType(ctx.getNodeParameter('recipientType', i) as string);
			const roleName = ctx.getNodeParameter('roleName', i) as string;
			const routingOrder = ctx.getNodeParameter('routingOrder', i, '1') as string;
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const recipient: IDataObject = { roleName, routingOrder };

			const directFields = [
				'email', 'name', 'recipientId', 'accessCode', 'note',
				'idCheckConfigurationName', 'templateLocked', 'templateRequired',
				'hostEmail', 'hostName', 'signerName',
			];
			for (const field of directFields) {
				if (additionalFields[field] !== undefined && additionalFields[field] !== '') {
					recipient[field] = additionalFields[field];
				}
			}

			if (additionalFields.deliveryMethod && additionalFields.deliveryMethod !== 'email') {
				recipient.deliveryMethod = additionalFields.deliveryMethod;
			}

			if (additionalFields.emailNotificationSubject || additionalFields.emailNotificationBody) {
				recipient.emailNotification = {
					emailSubject: additionalFields.emailNotificationSubject || '',
					emailBody: additionalFields.emailNotificationBody || '',
				};
			}

			return docuSignRequest(ctx, 'POST', basePath, { [recipientType]: [recipient] });
		}

		case 'update': {
			const recipientType = assertValidRecipientType(ctx.getNodeParameter('recipientType', i) as string);
			const recipientId = assertSafeId(ctx.getNodeParameter('recipientId', i) as string, 'Recipient ID');
			const updateFields = ctx.getNodeParameter('updateFields', i, {}) as IDataObject;

			const recipient: IDataObject = { recipientId };
			for (const [key, value] of Object.entries(updateFields)) {
				if (value !== undefined && value !== '') recipient[key] = value;
			}

			return docuSignRequest(ctx, 'PUT', basePath, { [recipientType]: [recipient] });
		}

		case 'delete': {
			const recipientId = assertSafeId(ctx.getNodeParameter('recipientId', i) as string, 'Recipient ID');
			return docuSignRequest(ctx, 'DELETE', basePath, { signers: [{ recipientId }] });
		}

		case 'deleteList': {
			const ids = (ctx.getNodeParameter('recipientIds', i) as string)
				.split(',').map((s) => s.trim()).filter(Boolean);
			const signers = ids.map((id) => ({ recipientId: assertSafeId(id, 'Recipient ID') }));
			return docuSignRequest(ctx, 'DELETE', basePath, { signers });
		}

		case 'createPreview': {
			const returnUrl = ctx.getNodeParameter('returnUrl', i) as string;
			return docuSignRequest(ctx, 'POST', `${basePath}/views/recipient_preview`, { returnUrl });
		}

		default:
			throw new Error(`Unsupported template recipient operation: ${operation}`);
	}
}
