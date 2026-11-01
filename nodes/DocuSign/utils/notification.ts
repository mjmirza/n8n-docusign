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
	return body;
}
