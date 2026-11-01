import type { IDataObject } from 'n8n-workflow';

/** Envelope and template notification requests nest the flat UI fields under expirations and reminders. */
export function buildNotificationBody(settings: IDataObject): IDataObject {
	const pick = (keys: string[]): IDataObject | undefined => {
		const out: IDataObject = {};
		for (const key of keys) {
			if (settings[key] !== undefined && settings[key] !== '') out[key] = String(settings[key]);
		}
		return Object.keys(out).length > 0 ? out : undefined;
	};
	const body: IDataObject = {};
	const expirations = pick(['expireAfter', 'expireEnabled', 'expireWarn']);
	const reminders = pick(['reminderDelay', 'reminderEnabled', 'reminderFrequency']);
	if (expirations) body.expirations = expirations;
	if (reminders) body.reminders = reminders;
	return completeNotification(body);
}

/**
 * DocuSign sets any block a request leaves out to 0, so a missing expirations block expires the
 * envelope the next day. expireEnabled false falls back to the account default instead.
 * Values only apply when their block is enabled, so setting them without the flag enables it.
 */
export function completeNotification(notification: IDataObject): IDataObject {
	const out: IDataObject = { ...notification };
	if (Object.keys(out).length === 0) return out;
	const exp = (out.expirations as IDataObject | undefined) ?? { expireEnabled: 'false' };
	if (exp.expireEnabled === undefined && (exp.expireAfter !== undefined || exp.expireWarn !== undefined)) {
		exp.expireEnabled = 'true';
	}
	out.expirations = exp;
	const rem = out.reminders as IDataObject | undefined;
	if (rem && rem.reminderEnabled === undefined && (rem.reminderDelay !== undefined || rem.reminderFrequency !== undefined)) {
		rem.reminderEnabled = 'true';
	}
	return out;
}
