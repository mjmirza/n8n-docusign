import { describe, it, expect } from '@jest/globals';
import {
	assertSafeId,
	getBaseUrl,
	sanitizeEndpoint,
	accountPath,
	envelopePath,
	templatePath,
} from '../nodes/DocuSign/transport';

describe('transport', () => {
	describe('assertSafeId', () => {
		it('should accept valid GUIDs', () => {
			expect(assertSafeId('0f0f0165-d266-4f04-af45-69fd6363461c')).toBe(
				'0f0f0165-d266-4f04-af45-69fd6363461c',
			);
		});

		it('should accept alphanumeric IDs', () => {
			expect(assertSafeId('abc123')).toBe('abc123');
			expect(assertSafeId('abc-123_def')).toBe('abc-123_def');
		});

		it('should accept numeric IDs', () => {
			expect(assertSafeId(12345)).toBe('12345');
			expect(assertSafeId('99')).toBe('99');
		});

		it('should accept special DocuSign values', () => {
			expect(assertSafeId('combined')).toBe('combined');
			expect(assertSafeId('archive')).toBe('archive');
			expect(assertSafeId('certificate')).toBe('certificate');
		});

		it('should trim whitespace', () => {
			expect(assertSafeId('  abc123  ')).toBe('abc123');
		});

		it('should reject empty strings', () => {
			expect(() => assertSafeId('')).toThrow(
				'must be between 1 and 255 characters',
			);
			expect(() => assertSafeId('   ')).toThrow(
				'must be between 1 and 255 characters',
			);
		});

		it('should reject IDs with path traversal', () => {
			expect(() => assertSafeId('../etc')).toThrow(
				'contains invalid characters',
			);
		});

		it('should reject IDs with slashes', () => {
			expect(() => assertSafeId('abc/123')).toThrow(
				'contains invalid characters',
			);
		});

		it('should reject IDs with special characters', () => {
			expect(() => assertSafeId('abc@123')).toThrow(
				'contains invalid characters',
			);
			expect(() => assertSafeId('abc 123')).toThrow(
				'contains invalid characters',
			);
			expect(() => assertSafeId('abc;drop')).toThrow(
				'contains invalid characters',
			);
			expect(() => assertSafeId('<script>')).toThrow(
				'contains invalid characters',
			);
		});

		it('should reject overly long IDs', () => {
			const longId = 'a'.repeat(256);
			expect(() => assertSafeId(longId)).toThrow(
				'must be between 1 and 255 characters',
			);
		});

		it('should accept max-length IDs', () => {
			const maxId = 'a'.repeat(255);
			expect(assertSafeId(maxId)).toBe(maxId);
		});

		it('should use custom label in error', () => {
			expect(() => assertSafeId('', 'Envelope ID')).toThrow('Envelope ID');
			expect(() => assertSafeId('a/b', 'Account ID')).toThrow('Account ID');
		});
	});

	describe('getBaseUrl', () => {
		it('should return demo URL', () => {
			expect(getBaseUrl('demo')).toBe(
				'https://demo.docusign.net/restapi/v2.1',
			);
		});

		it('should return production URL', () => {
			expect(getBaseUrl('production')).toBe(
				'https://www.docusign.net/restapi/v2.1',
			);
		});

		it('should reject invalid environments', () => {
			expect(() => getBaseUrl('staging')).toThrow(
				'Invalid DocuSign environment',
			);
			expect(() => getBaseUrl('')).toThrow('Invalid DocuSign environment');
			expect(() => getBaseUrl('DEMO')).toThrow('Invalid DocuSign environment');
		});
	});

	describe('sanitizeEndpoint', () => {
		it('should strip leading slashes', () => {
			expect(sanitizeEndpoint('/accounts/123')).toBe('accounts/123');
			expect(sanitizeEndpoint('///accounts/123')).toBe('accounts/123');
		});

		it('should allow valid paths', () => {
			expect(sanitizeEndpoint('accounts/abc-123/envelopes')).toBe(
				'accounts/abc-123/envelopes',
			);
			expect(
				sanitizeEndpoint('accounts/abc/envelopes/def/documents/1'),
			).toBe('accounts/abc/envelopes/def/documents/1');
		});

		it('should allow paths with query parameters', () => {
			expect(sanitizeEndpoint('accounts/abc?count=10')).toBe(
				'accounts/abc?count=10',
			);
			expect(sanitizeEndpoint('accounts/abc?a=1&b=2')).toBe(
				'accounts/abc?a=1&b=2',
			);
		});

		it('should block path traversal (literal)', () => {
			expect(() => sanitizeEndpoint('../etc/passwd')).toThrow(
				'path traversal',
			);
			expect(() => sanitizeEndpoint('accounts/../../secret')).toThrow(
				'path traversal',
			);
			expect(() => sanitizeEndpoint('a/..\\b')).toThrow(
				'path traversal',
			);
		});

		it('should block percent-encoded path traversal', () => {
			// %2e = '.', %2f = '/'
			expect(() => sanitizeEndpoint('%2e%2e/etc')).toThrow();
			expect(() => sanitizeEndpoint('accounts/%2e%2e')).toThrow();
		});

		it('should reject malformed percent-encoding', () => {
			expect(() => sanitizeEndpoint('accounts/%zz')).toThrow();
		});

		it('should block dangerous characters', () => {
			expect(() => sanitizeEndpoint('accounts/<script>')).toThrow(
				'disallowed characters',
			);
			expect(() => sanitizeEndpoint('accounts/`cmd`')).toThrow(
				'disallowed characters',
			);
			expect(() => sanitizeEndpoint('accounts/|pipe')).toThrow(
				'disallowed characters',
			);
			expect(() => sanitizeEndpoint('accounts/{inject}')).toThrow(
				'disallowed characters',
			);
		});

		it('should block percent character (prevents double-encoding)', () => {
			expect(() => sanitizeEndpoint('accounts/abc%20def')).toThrow(
				'disallowed characters',
			);
		});
	});

	describe('accountPath', () => {
		it('should build correct account path', () => {
			expect(accountPath('abc-123')).toBe('accounts/abc-123');
		});

		it('should build path with GUID', () => {
			expect(accountPath('0f0f0165-d266-4f04-af45-69fd6363461c')).toBe(
				'accounts/0f0f0165-d266-4f04-af45-69fd6363461c',
			);
		});

		it('should reject invalid account IDs', () => {
			expect(() => accountPath('abc/123')).toThrow(
				'contains invalid characters',
			);
			expect(() => accountPath('')).toThrow('must be between');
		});
	});

	describe('envelopePath', () => {
		it('should build correct envelope path', () => {
			expect(envelopePath('acct-1', 'env-2')).toBe(
				'accounts/acct-1/envelopes/env-2',
			);
		});

		it('should reject invalid account ID', () => {
			expect(() => envelopePath('a/b', 'env-2')).toThrow(
				'contains invalid characters',
			);
		});

		it('should reject invalid envelope ID', () => {
			expect(() => envelopePath('acct-1', 'e/v')).toThrow(
				'contains invalid characters',
			);
		});
	});

	describe('templatePath', () => {
		it('should build correct template path', () => {
			expect(templatePath('acct-1', 'tmpl-2')).toBe(
				'accounts/acct-1/templates/tmpl-2',
			);
		});

		it('should reject invalid template ID', () => {
			expect(() => templatePath('acct-1', '../etc')).toThrow(
				'contains invalid characters',
			);
		});
	});
});
