import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all User Contact operations.
 */
export async function handleUserContact(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/contacts`;

	switch (operation) {
		case 'get': {
			const contactId = assertSafeId(
				ctx.getNodeParameter('contactId', i) as string,
				'Contact ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${contactId}`);
		}

		case 'create': {
			const name = ctx.getNodeParameter('name', i) as string;
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const contact: IDataObject = { name };
			if (additionalFields.contactId) contact.contactId = additionalFields.contactId;
			if (additionalFields.emails) {
				contact.emails = JSON.parse(additionalFields.emails as string);
			}
			if (additionalFields.organization) contact.organization = additionalFields.organization;
			if (additionalFields.contactPhoneNumbers) {
				contact.contactPhoneNumbers = JSON.parse(additionalFields.contactPhoneNumbers as string);
			}
			if (additionalFields.signingGroup) contact.signingGroup = additionalFields.signingGroup;
			if (additionalFields.signingGroupName) contact.signingGroupName = additionalFields.signingGroupName;
			if (additionalFields.shared !== undefined) contact.shared = additionalFields.shared;

			return docuSignRequest(ctx, 'POST', basePath, { contactList: [contact] } as unknown as IDataObject);
		}

		case 'update': {
			const contacts = JSON.parse(
				ctx.getNodeParameter('contactsBody', i) as string,
			);
			// contactModRequest takes contactList; accept a bare array or an object that already has it.
			const contactList = Array.isArray(contacts) ? contacts : (contacts as IDataObject).contactList ?? [contacts];
			return docuSignRequest(ctx, 'PUT', basePath, { contactList } as unknown as IDataObject);
		}

		case 'delete': {
			const contactId = assertSafeId(
				ctx.getNodeParameter('contactId', i) as string,
				'Contact ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${contactId}`);
		}

		case 'deleteList': {
			const contactIdsStr = ctx.getNodeParameter('contactIds', i) as string;
			const contactList = contactIdsStr.split(',').map((id) => ({
				contactId: assertSafeId(id.trim(), 'Contact ID'),
			}));
			return docuSignRequest(ctx, 'DELETE', basePath, { contactList } as unknown as IDataObject);
		}

		default:
			throw new Error(`Unsupported user contact operation: ${operation}`);
	}
}
