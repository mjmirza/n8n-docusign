import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { applyDeliveryMethod, buildRecipientEmailNotification } from '../../utils/recipientDelivery';
import { docuSignRequest, assertSafeId, envelopePath } from '../../transport';

/** Allowlist of valid DocuSign recipient types — prevents prototype pollution */
const VALID_RECIPIENT_TYPES = new Set([
	'signers',
	'carbonCopies',
	'certifiedDeliveries',
	'inPersonSigners',
	'agents',
	'editors',
	'intermediaries',
	'witnesses',
	'notaries',
	'seals',
]);

function assertValidRecipientType(value: string): string {
	if (!VALID_RECIPIENT_TYPES.has(value)) {
		throw new Error(
			`Invalid recipient type. Must be one of: ${[...VALID_RECIPIENT_TYPES].join(', ')}`,
		);
	}
	return value;
}

/**
 * Handle all Recipient resource operations.
 */
export async function handleRecipient(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	)}/recipients`;

	switch (operation) {
		case 'getAll': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'add': {
			const recipientType = assertValidRecipientType(
				ctx.getNodeParameter('recipientType', i) as string,
			);
			const email = ctx.getNodeParameter('recipientEmail', i) as string;
			const name = ctx.getNodeParameter('recipientName', i) as string;
			const recipientId = ctx.getNodeParameter('recipientId', i, '') as string;
			const routingOrder = ctx.getNodeParameter('routingOrder', i, '1') as string;
			const additionalFields = ctx.getNodeParameter(
				'additionalFields',
				i,
				{},
			) as IDataObject;

			const recipient: IDataObject = {
				email,
				name,
				routingOrder,
			};

			if (recipientId) recipient.recipientId = assertSafeId(recipientId, 'Recipient ID');

			// All additional recipient fields
			const directFields = [
				'clientUserId', 'accessCode', 'note', 'roleName',
				'requireSignOnPaper', 'embeddedRecipientStartURL',
				'idCheckConfigurationName', 'requireIdLookup', 'signingGroupId',
				'hostEmail', 'hostName', 'signerName',
			];
			for (const field of directFields) {
				if (additionalFields[field] !== undefined && additionalFields[field] !== '') {
					recipient[field] = additionalFields[field];
				}
			}
			// An ID check only applies with requireIdLookup true, so choosing one turns it on.
			if (recipient.idCheckConfigurationName) recipient.requireIdLookup = 'true';

			// Delivery method + phone
			applyDeliveryMethod(recipient, additionalFields.deliveryMethod, additionalFields.phoneNumber);

			// Per-recipient email notification
			const emailNotification = buildRecipientEmailNotification(additionalFields);
			if (emailNotification) recipient.emailNotification = emailNotification;

			return docuSignRequest(ctx, 'POST', basePath, {
				[recipientType]: [recipient],
			});
		}

		case 'update': {
			const recipientType = assertValidRecipientType(
				ctx.getNodeParameter('recipientType', i) as string,
			);
			const recipientId = assertSafeId(
				ctx.getNodeParameter('recipientId', i) as string,
				'Recipient ID',
			);
			const updateFields = ctx.getNodeParameter(
				'updateFields',
				i,
				{},
			) as IDataObject;

			const recipient: IDataObject = { recipientId };
			if (updateFields.email) recipient.email = updateFields.email;
			if (updateFields.name) recipient.name = updateFields.name;
			if (updateFields.routingOrder)
				recipient.routingOrder = updateFields.routingOrder;
			if (updateFields.note) recipient.note = updateFields.note;
			if (updateFields.accessCode) recipient.accessCode = updateFields.accessCode;
			if (updateFields.clientUserId) recipient.clientUserId = updateFields.clientUserId;
			applyDeliveryMethod(recipient, updateFields.deliveryMethod, updateFields.phoneNumber);
			if (updateFields.emailNotificationSubject || updateFields.emailNotificationBody) {
				const emailNotification: IDataObject = {};
				if (updateFields.emailNotificationSubject) emailNotification.emailSubject = updateFields.emailNotificationSubject;
				if (updateFields.emailNotificationBody) emailNotification.emailBody = updateFields.emailNotificationBody;
				recipient.emailNotification = emailNotification;
			}

			return docuSignRequest(ctx, 'PUT', basePath, {
				[recipientType]: [recipient],
			});
		}

		case 'delete': {
			const recipientId = assertSafeId(
				ctx.getNodeParameter('recipientId', i) as string,
				'Recipient ID',
			);
			return docuSignRequest(ctx, 'DELETE', basePath, {
				signers: [{ recipientId }],
			});
		}

		default:
			throw new Error(`Unsupported recipient operation: ${operation}`);
	}
}
