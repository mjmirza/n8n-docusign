// Runs every operation the picker offers with placeholder input. The spec-route check in
// tests/setup/spec-routes.ts then fails on any request whose method and path DocuSign lacks.
import { describe, it, expect, beforeEach } from '@jest/globals';
import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { DocuSign } from '../nodes/DocuSign/DocuSign.node';
import { createMockContext, getRecordedRequests, noteUserJson } from './helpers/mockContext';
import { clearBaseUriCache } from '../nodes/DocuSign/transport';

const node = new DocuSign();

/** Operations that stop before any request without real content; covered by their own tests. */
const NEEDS_REAL_INPUT = new Set(['templateDocument/update']);
const pairs: Array<[string, string]> = [];
for (const prop of node.description.properties) {
	if (prop.name !== 'operation') continue;
	const resources = (prop.displayOptions?.show?.resource as string[] | undefined) ?? [];
	for (const resource of resources) {
		for (const option of (prop.options ?? []) as Array<{ value: string }>) pairs.push([resource, option.value]);
	}
}

/** The field definition the picker shows for this resource and operation, if any. */
function fieldFor(name: string, resource: string, operation: string): INodeProperties | undefined {
	return node.description.properties.find((p) => {
		if (p.name !== name) return false;
		const show = p.displayOptions?.show;
		const resources = show?.resource as string[] | undefined;
		const operations = show?.operation as string[] | undefined;
		return (!resources || resources.includes(resource)) && (!operations || operations.includes(operation));
	});
}

/** Plausible input for a field: its first option, empty JSON, or an ID, so each handler sends its request. */
function placeholder(name: string, fallback: unknown, resource: string, operation: string): unknown {
	const field = fieldFor(name, resource, operation);
	if (field?.type === 'options') {
		const options = (field.options ?? []) as Array<{ value: unknown }>;
		return field.default !== '' && field.default !== undefined ? field.default : options[0]?.value;
	}
	if (field?.type === 'json') return field.default && field.default !== '' ? field.default : '{}';
	if (field?.type === 'boolean' || field?.type === 'number') return field.default;
	if (field?.type === 'collection' || field?.type === 'fixedCollection') return {};
	if (/Id$/.test(name)) return 'id-1';
	if (/Ids$/.test(name)) return 'id-1,id-2';
	if (/(Json|Body|body|Rules|requestBody)$/.test(name)) return '{}';
	if (/[Ee]mail$/.test(name)) return 'a@example.com';
	if (name === 'returnAll') return false;
	if (name === 'limit' || name === 'maxResults') return 5;
	if (/[Uu]rl$/.test(name)) return 'https://example.com/back';
	if (/[Bb]inaryPropertyName$|binaryProperty$/.test(name)) return 'data';
	if (fallback !== undefined) return fallback;
	return 'x';
}

function contextFor(resource: string, operation: string): IExecuteFunctions {
	const ctx = createMockContext({
		credentials: { docuSignOAuth2Api: { environment: 'demo' } },
		httpResponses: Array.from({ length: 5 }, () => ({})),
		binaryData: { 0: { data: { data: 'JVBERg==', mimeType: 'application/pdf', fileName: 'f.pdf' } } },
		continueOnFail: true,
	});
	(ctx as unknown as IDataObject).getNodeParameter = (name: string, _i: number, fallback?: unknown) => {
		if (name === 'resource') return resource;
		if (name === 'operation') return operation;
		const value = placeholder(name, fallback, resource, operation);
		noteUserJson(value);
		return value;
	};
	return ctx;
}

describe('every picker operation calls a route DocuSign defines', () => {
	beforeEach(() => clearBaseUriCache());

	it('covers the picker', () => {
		expect(pairs.length).toBeGreaterThan(300);
	});

	it.each(pairs)('%s / %s', async (resource, operation) => {
		const ctx = contextFor(resource, operation);
		const out = await node.execute.call(ctx);
		const sent = getRecordedRequests(ctx).length;
		if (process.env.SWEEP_REPORT) console.log(`SWEEP ${resource}/${operation} sent=${sent} out=${JSON.stringify(out[0]?.[0]?.json ?? {}).slice(0, 160)}`);
		// Every operation must reach DocuSign with placeholder input, except the ones listed below.
		const needsInput = NEEDS_REAL_INPUT.has(`${resource}/${operation}`);
		expect(sent).toBe(needsInput ? 0 : 1);
		// continueOnFail turns a failure into an error item; a passing operation must not produce one.
		if (!needsInput) expect(out[0]?.[0]?.json).not.toHaveProperty('error');
	});
});

/** JSON fields shown for an operation; their content is meant to reach DocuSign as the body. */
function jsonFieldsFor(resource: string, operation: string): string[] {
	return node.description.properties
		.filter((p) => p.type === 'json')
		.filter((p) => {
			const show = p.displayOptions?.show;
			return (show?.resource as string[] | undefined)?.includes(resource) &&
				(show?.operation as string[] | undefined)?.includes(operation);
		})
		.map((p) => p.name);
}

const jsonPairs = pairs.filter(([r, o]) => jsonFieldsFor(r, o).length > 0);

describe('JSON input reaches DocuSign in the request body', () => {
	beforeEach(() => clearBaseUriCache());

	it.each(jsonPairs)('%s / %s', async (resource, operation) => {
		const fields = new Set(jsonFieldsFor(resource, operation));
		const ctx = contextFor(resource, operation);
		const base = (ctx as unknown as { getNodeParameter: (n: string, i: number, f?: unknown) => unknown }).getNodeParameter;
		(ctx as unknown as IDataObject).getNodeParameter = (name: string, i: number, fallback?: unknown) =>
			fields.has(name) ? (noteUserJson('{"probe":"marker-7"}'), '{"probe":"marker-7"}') : base(name, i, fallback);
		await node.execute.call(ctx);
		const sent = getRecordedRequests(ctx)[0];
		expect(sent).toBeDefined();
		expect(JSON.stringify(sent.options.body ?? sent.options.qs ?? {})).toContain('marker-7');
	});
});
