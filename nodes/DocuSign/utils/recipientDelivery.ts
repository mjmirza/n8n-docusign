import type { IDataObject } from 'n8n-workflow';

/** Parses "+49 1701234567" into DocuSign's phone shape; without a space it is all number. */
export function toRecipientPhone(value: string): IDataObject {
	const trimmed = value.trim();
	const match = /^\+?(\d{1,4})[\s-]+(.+)$/.exec(trimmed);
	if (match) {
		return { countryCode: match[1], number: match[2].replace(/\D/g, '') };
	}
	return { number: trimmed.replace(/\D/g, '') };
}

/** Sets DocuSign's delivery method ("SMS", not "sms") and the phone shape it requires. */
export function applyDeliveryMethod(target: IDataObject, method: unknown, phone: unknown): void {
	if (!method || method === 'email') return;
	target.deliveryMethod = method === 'sms' ? 'SMS' : method;
	if (phone) target.phoneNumber = toRecipientPhone(String(phone));
}
