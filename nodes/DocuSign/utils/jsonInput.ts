/**
 * Parses a JSON parameter. An n8n expression can already resolve to an object or array, which is
 * used as-is; only text is parsed. Errors match JSON.parse so existing error handling still applies.
 */
export function parseJsonInput(value: unknown): ReturnType<typeof JSON.parse> {
	if (value !== null && typeof value === 'object') return value;
	return JSON.parse(String(value));
}
