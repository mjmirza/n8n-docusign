/**
 * COMPLIANCE TEST SUITE
 *
 * Verifies regulatory and operational compliance requirements:
 * - GDPR: Data purge capabilities, data minimization
 * - OWASP: Top 10 vulnerability prevention
 * - n8n: Node development standards compliance
 * - DocuSign: API contract compliance
 * - Operational: Rate limiting, timeout, retry policies
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { assertSafeId, sanitizeEndpoint, getBaseUrl, docuSignRequest } from '../nodes/DocuSign/transport';
import { createMockContext, createHttpError, getRecordedRequests } from './helpers/mockContext';
import { DocuSign } from '../nodes/DocuSign/DocuSign.node';
import {
	assertValidEmail,
	assertValidDate,
	assertInRange,
	assertNonEmpty,
	assertValidBase64,
	assertFileSize,
} from '../nodes/DocuSign/utils/validators';

// Some tests assert inside catch; an unexpected success must fail them.
beforeEach(() => {
	expect.hasAssertions();
});

// ==================================================================
// 1. GDPR COMPLIANCE
// ==================================================================
describe('Compliance: GDPR', () => {
	it('envelope purge state field exists for data erasure', () => {
		const purge = JSON.stringify(new DocuSign().description.properties).includes('"purgeState"');
		expect(purge).toBe(true);
	});

	it('error messages do not contain PII', () => {
		try {
			assertSafeId('john.doe@company.com/../../admin');
		} catch (e) {
			const msg = (e as Error).message;
			expect(msg).not.toContain('john');
			expect(msg).not.toContain('doe');
			expect(msg).not.toContain('company');
			expect(msg).not.toContain('@');
		}
	});

	it('email validation does not store invalid emails', () => {
		try {
			assertValidEmail('invalid-email');
		} catch (e) {
			const msg = (e as Error).message;
			// Should not echo back the invalid email
			expect(msg).not.toContain('invalid-email');
		}
	});

	it('ID validation does not echo sensitive IDs', () => {
		// Each ID carries a character assertSafeId rejects, so the error path really runs.
		const sensitiveIds = [
			'SSN 123-45-6789',
			'credit-card=4111111111111111',
			'password:SuperSecret123',
		];
		for (const id of sensitiveIds) {
			let msg = '';
			expect(() => {
				try {
					assertSafeId(id);
				} catch (e) {
					msg = (e as Error).message;
					throw e;
				}
			}).toThrow();
			expect(msg).not.toContain('SSN');
			expect(msg).not.toContain('4111');
			expect(msg).not.toContain('SuperSecret');
		}
	});
});

// ==================================================================
// 2. OWASP TOP 10 COMPLIANCE
// ==================================================================
describe('Compliance: OWASP Top 10', () => {
	// A01:2021 — Broken Access Control
	it('A01: Path traversal blocked in all ID parameters', () => {
		const traversalPatterns = [
			'../../../etc/passwd',
			'..\\..\\windows\\system32',
			'....//....//etc/passwd',
			'%2e%2e%2fetc/passwd',
			'..%252f..%252f',
		];
		for (const pattern of traversalPatterns) {
			expect(() => assertSafeId(pattern)).toThrow();
		}
	});

	it('A01: Path traversal blocked in endpoints', () => {
		expect(() => sanitizeEndpoint('../../../etc/passwd')).toThrow();
		expect(() => sanitizeEndpoint('%2e%2e/secret')).toThrow();
	});

	// A02:2021 — Cryptographic Failures
	it('A02: Base URLs enforce HTTPS only', () => {
		const demoUrl = getBaseUrl('demo');
		const prodUrl = getBaseUrl('production');
		expect(demoUrl).toMatch(/^https:\/\//);
		expect(prodUrl).toMatch(/^https:\/\//);
	});

	// A03:2021 — Injection
	it('A03: SQL injection patterns blocked in IDs', () => {
		const sqlPatterns = [
			"'; DROP TABLE users; --",
			"1' OR '1'='1",
			"1; SELECT * FROM users",
			"UNION SELECT password FROM users",
		];
		for (const pattern of sqlPatterns) {
			expect(() => assertSafeId(pattern)).toThrow();
		}
	});

	it('A03: Command injection patterns blocked in IDs', () => {
		const cmdPatterns = [
			'$(whoami)',
			'`id`',
			'|cat /etc/passwd',
			';rm -rf /',
			'&&curl evil.com',
		];
		for (const pattern of cmdPatterns) {
			expect(() => assertSafeId(pattern)).toThrow();
		}
	});

	it('A03: XSS patterns blocked in IDs', () => {
		const xssPatterns = [
			'<script>alert(1)</script>',
			'"><img src=x onerror=alert(1)>',
			"javascript:alert('XSS')",
		];
		for (const pattern of xssPatterns) {
			expect(() => assertSafeId(pattern)).toThrow();
		}
	});

	// A04:2021 — Insecure Design
	it('A04: Only valid DocuSign environments accepted', () => {
		expect(() => getBaseUrl('staging')).toThrow();
		expect(() => getBaseUrl('localhost')).toThrow();
		expect(() => getBaseUrl('http://evil.com')).toThrow();
		expect(() => getBaseUrl('')).toThrow();
	});

	// A05:2021 — Security Misconfiguration
	it('A05: Endpoint sanitization blocks dangerous characters', () => {
		const dangerousChars = ['<', '>', '`', '|', '{', '}', '^', '~'];
		for (const char of dangerousChars) {
			expect(() => sanitizeEndpoint(`accounts/test${char}inject`)).toThrow();
		}
	});

	// A07:2021 — Identification and Authentication Failures
	it('A07: Empty credentials throw descriptive error', async () => {
		const ctx = createMockContext({ httpResponses: [{ ok: true }] });
		await expect(docuSignRequest(ctx, 'GET', 'accounts/a')).rejects.toThrow('No DocuSign credentials configured');
	});

	// A08:2021 — Software and Data Integrity Failures
	it('A08: Base64 content validated before use', () => {
		expect(() => assertValidBase64('not!valid!base64!!!')).toThrow();
		expect(assertValidBase64('SGVsbG8=')).toBe('SGVsbG8=');
	});

	// A09:2021 — Security Logging and Monitoring Failures
	it('A09: Error messages are bounded to prevent log injection', () => {
		const longInput = 'A'.repeat(50000);
		// assertNonEmpty should reject overly long inputs
		expect(() => assertNonEmpty(longInput, 'Field', 10000)).toThrow('exceeds maximum length');
	});
});

// ==================================================================
// 3. n8n NODE COMPLIANCE
// ==================================================================
describe('Compliance: n8n Node Standards', () => {
	it('package.json has required n8n fields', () => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const pkg = require('../package.json');
		expect(pkg.name).toMatch(/^n8n-nodes-/);
		expect(pkg.keywords).toContain('n8n-community-node-package');
		expect(pkg.n8n).toBeDefined();
		expect(pkg.n8n.n8nNodesApiVersion).toBe(1);
		expect(pkg.n8n.nodes).toBeDefined();
		expect(pkg.n8n.credentials).toBeDefined();
		expect(pkg.peerDependencies['n8n-workflow']).toBe('*');
	});

	it('no runtime dependencies (zero-dep requirement)', () => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const pkg = require('../package.json');
		expect(pkg.dependencies).toBeUndefined();
	});
});

// ==================================================================
// 4. INPUT VALIDATION COMPLIANCE
// ==================================================================
describe('Compliance: Input Validation', () => {
	it('email validation: rejects all invalid formats', () => {
		const invalidEmails = [
			'', '  ', 'plaintext', '@no-local.com', 'no-domain@',
			'spaces in@email.com', 'double@@at.com',
		];
		for (const email of invalidEmails) {
			expect(() => assertValidEmail(email)).toThrow();
		}
	});

	it('email validation: accepts all valid formats', () => {
		const validEmails = [
			'user@example.com', 'user+tag@sub.domain.com',
			'user123@test.co.uk', 'first.last@company.org',
		];
		for (const email of validEmails) {
			expect(assertValidEmail(email)).toBeTruthy();
		}
	});

	it('date validation: rejects invalid dates', () => {
		expect(() => assertValidDate('not-a-date')).toThrow();
		expect(() => assertValidDate('')).toThrow();
		expect(() => assertValidDate('32/13/2024')).toThrow();
	});

	it('date validation: accepts valid ISO dates', () => {
		expect(assertValidDate('2024-01-15T10:30:00Z')).toContain('2024');
		expect(assertValidDate('2024-06-15')).toContain('2024');
	});

	it('range validation: enforces boundaries', () => {
		expect(() => assertInRange(-1, 0, 100)).toThrow();
		expect(() => assertInRange(101, 0, 100)).toThrow();
		expect(() => assertInRange(Infinity, 0, 100)).toThrow();
		expect(() => assertInRange(NaN, 0, 100)).toThrow();
		expect(assertInRange(50, 0, 100)).toBe(50);
	});

	it('file size validation: enforces 25MB DocuSign limit', () => {
		expect(() => assertFileSize(0)).toThrow('empty');
		expect(() => assertFileSize(-1)).toThrow('empty');
		expect(() => assertFileSize(26 * 1024 * 1024)).toThrow('exceeds');
		expect(() => assertFileSize(25 * 1024 * 1024)).not.toThrow();
	});

	it('non-empty validation: rejects whitespace-only strings', () => {
		expect(() => assertNonEmpty('')).toThrow();
		expect(() => assertNonEmpty('   ')).toThrow();
		expect(() => assertNonEmpty('\t\n')).toThrow();
		expect(assertNonEmpty('valid')).toBe('valid');
	});
});

// ==================================================================
// 5. OPERATIONAL COMPLIANCE
// ==================================================================
describe('Compliance: Operational Standards', () => {
	const C = { docuSignOAuth2Api: { environment: 'demo' } };
	const transient = (code: number) => createHttpError(code, {}, `HTTP ${code}`, { 'retry-after': '1' });

	it('sets a 30 second timeout on every request', async () => {
		const ctx = createMockContext({ credentials: C, httpResponses: [{ ok: true }] });
		await docuSignRequest(ctx, 'GET', 'accounts/a');
		expect(getRecordedRequests(ctx)[0].options.timeout).toBe(30_000);
	});

	it('gives up after 3 retries (4 attempts) on a persistent transient error', async () => {
		const ctx = createMockContext({
			credentials: C,
			httpResponses: [transient(503), transient(503), transient(503), transient(503), { ok: true }],
		});
		await expect(docuSignRequest(ctx, 'GET', 'accounts/a')).rejects.toThrow('[503]');
		expect(getRecordedRequests(ctx)).toHaveLength(4);
	}, 15_000);

	it('fails a 500 immediately without retrying', async () => {
		const ctx = createMockContext({ credentials: C, httpResponses: [createHttpError(500), { ok: true }] });
		await expect(docuSignRequest(ctx, 'GET', 'accounts/a')).rejects.toThrow('[500]');
		expect(getRecordedRequests(ctx)).toHaveLength(1);
	});
});
