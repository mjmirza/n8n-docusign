// Every request a test sends must exist in the DocuSign eSignature v2.1 OpenAPI spec,
// so a handler with a wrong method or path fails even when its test only awaits a canned reply.
import { afterEach } from '@jest/globals';
import { drainAllRequests, offSpecAllowed } from '../helpers/mockContext';
import spec from '../fixtures/esign-v2.1-routes.json';

const ROUTES = ([...spec.routes, ...spec.v2Routes.routes] as Array<[string, string]>).map(([method, template]) => ({
	method,
	template,
	pattern: new RegExp(`^${template.replace(/\{[^}]+\}/g, '[^/]+')}$`),
}));

/** Maps a request to the spec template it hits, or undefined when the spec has no such route. */
export function matchSpecRoute(method: string, url: string): string | undefined {
	const path = new URL(url).pathname.replace(/^\/restapi/, '') || '/';
	return ROUTES.find((r) => r.method === method.toUpperCase() && r.pattern.test(path))?.template;
}

afterEach(() => {
	const allowed = offSpecAllowed();
	const unknown = drainAllRequests()
		.filter(() => !allowed)
		.map((r) => ({ method: String(r.options.method ?? 'GET'), url: String(r.options.url ?? '') }))
		.filter((r) => r.url.startsWith('https://') && !matchSpecRoute(r.method, r.url))
		.map((r) => `${r.method} ${r.url}`);
	// A plain throw keeps this hook from counting toward a test's hasAssertions guard.
	if (unknown.length > 0) throw new Error(`Requests not in the DocuSign spec:\n${unknown.join('\n')}`);
});
