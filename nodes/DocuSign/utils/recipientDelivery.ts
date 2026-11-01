import type { IDataObject } from 'n8n-workflow';

/** ITU-T E.164 calling codes are prefix-free: 1 and 7 are one digit, these are two, the rest three. */
const TWO_DIGIT_CODES = new Set([
	'20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47',
	'48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65',
	'66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98',
]);

function callingCodeLength(digits: string): number {
	if (digits[0] === '1' || digits[0] === '7') return 1;
	return TWO_DIGIT_CODES.has(digits.slice(0, 2)) ? 2 : 3;
}

/** Parses "+49 1701234567" or "+14155550100" into DocuSign's phone shape; no "+" and no space means all number. */
export function toRecipientPhone(value: string): IDataObject {
	const trimmed = value.trim();
	const match = /^\+?(\d{1,4})[\s-]+(.+)$/.exec(trimmed);
	if (match) {
		return { countryCode: match[1], number: match[2].replace(/\D/g, '') };
	}
	if (trimmed.startsWith('+')) {
		const digits = trimmed.replace(/\D/g, '');
		const len = callingCodeLength(digits);
		return { countryCode: digits.slice(0, len), number: digits.slice(len) };
	}
	return { number: trimmed.replace(/\D/g, '') };
}

/** Sets DocuSign's delivery method ("SMS", not "sms") and the phone shape it requires. */
export function applyDeliveryMethod(target: IDataObject, method: unknown, phone: unknown): void {
	if (!method) return;
	if (method === 'email') {
		// Sending it explicitly lets an update switch an SMS recipient back to email.
		target.deliveryMethod = 'email';
		return;
	}
	target.deliveryMethod = method === 'sms' ? 'SMS' : method;
	if (phone) target.phoneNumber = toRecipientPhone(String(phone));
}

/** recipientEmailNotification from the subject, body and language fields; only the ones set are sent. */
export function buildRecipientEmailNotification(fields: IDataObject): IDataObject | undefined {
	const out: IDataObject = {};
	if (fields.emailNotificationSubject) out.emailSubject = fields.emailNotificationSubject;
	if (fields.emailNotificationBody) out.emailBody = fields.emailNotificationBody;
	if (fields.supportedLanguage) out.supportedLanguage = fields.supportedLanguage;
	return Object.keys(out).length > 0 ? out : undefined;
}

/** Phone Auth $ needs phoneAuthentication; sender numbers are offered, otherwise the recipient supplies one. */
export function buildPhoneAuthentication(idCheck: unknown, numbers: unknown): IDataObject | undefined {
	if (idCheck !== 'Phone Auth $') return undefined;
	const list = String(numbers ?? '').split(',').map((n) => n.trim()).filter(Boolean);
	return { recipMayProvideNumber: list.length > 0 ? 'false' : 'true', senderProvidedNumbers: list };
}
