// Every request a test sends must exist in the DocuSign eSignature v2.1 OpenAPI spec,
// so a handler with a wrong method or path fails even when its test only awaits a canned reply.
import { afterEach } from '@jest/globals';
import { drainAllRequests, offSpecAllowed } from '../helpers/mockContext';
import spec from '../fixtures/esign-v2.1-routes.json';

const QUERY = spec.queryParams as Record<string, string[]>;

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

/** Query parameter names a request sends that the spec does not define for its route. */
export function unknownQueryParams(method: string, url: string, qs: unknown): string[] {
	const template = matchSpecRoute(method, url);
	if (!template || !qs || typeof qs !== 'object') return [];
	const known = new Set(QUERY[`${method.toUpperCase()} ${template}`] ?? []);
	return Object.keys(qs as object).filter((k) => !known.has(k));
}

afterEach(() => {
	const allowed = offSpecAllowed();
	const unknown = drainAllRequests()
		.filter(() => !allowed)
		.map((r) => ({ method: String(r.options.method ?? 'GET'), url: String(r.options.url ?? ''), qs: r.options.qs }))
		.filter((r) => r.url.startsWith('https://'))
		.flatMap((r) => {
			if (!matchSpecRoute(r.method, r.url)) return [`${r.method} ${r.url}`];
			const extra = unknownQueryParams(r.method, r.url, r.qs);
			return extra.length ? [`${r.method} ${r.url} unknown query: ${extra.join(', ')}`] : [];
		});
	// A plain throw keeps this hook from counting toward a test's hasAssertions guard.
	if (unknown.length > 0) throw new Error(`Requests not in the DocuSign spec:\n${unknown.join('\n')}`);
});
