import { describe, it, expect } from '@jest/globals';
import {
	assertValidEmail,
	assertValidDate,
	assertInRange,
	assertNonEmpty,
	assertValidBase64,
	assertFileSize,
	parseCommaSeparated,
} from '../nodes/DocuSign/utils/validators';

describe('validators', () => {
	describe('assertValidEmail', () => {
		it('should accept valid emails', () => {
			expect(assertValidEmail('user@example.com')).toBe('user@example.com');
			expect(assertValidEmail('  user@example.com  ')).toBe('user@example.com');
			expect(assertValidEmail('user+tag@sub.example.co.uk')).toBe(
				'user+tag@sub.example.co.uk',
			);
		});

		it('should reject empty email', () => {
			expect(() => assertValidEmail('')).toThrow('required');
			expect(() => assertValidEmail('   ')).toThrow('required');
		});

		it('should reject invalid format', () => {
			expect(() => assertValidEmail('not-an-email')).toThrow('not a valid email');
			expect(() => assertValidEmail('@missing-local.com')).toThrow('not a valid email');
			expect(() => assertValidEmail('missing@')).toThrow('not a valid email');
			expect(() => assertValidEmail('no spaces@example.com')).toThrow('not a valid email');
		});

		it('should reject overly long emails', () => {
			const longEmail = 'a'.repeat(250) + '@b.com';
			expect(() => assertValidEmail(longEmail)).toThrow('exceeds maximum length');
		});

		it('should use custom label in error', () => {
			expect(() => assertValidEmail('', 'Signer Email')).toThrow('Signer Email');
		});
	});

	describe('assertValidDate', () => {
		it('should accept valid ISO dates', () => {
			const result = assertValidDate('2024-01-15T10:30:00Z');
			expect(result).toBe('2024-01-15T10:30:00.000Z');
		});

		it('should accept date-only strings', () => {
			const result = assertValidDate('2024-06-15');
			expect(result).toContain('2024-06-15');
		});

		it('should reject invalid dates', () => {
			expect(() => assertValidDate('not-a-date')).toThrow('not a valid date');
		});

		it('should reject empty dates', () => {
			expect(() => assertValidDate('')).toThrow('required');
			expect(() => assertValidDate('   ')).toThrow('required');
		});

		it('should use custom label', () => {
			expect(() => assertValidDate('bad', 'From Date')).toThrow('From Date');
		});
	});

	describe('assertInRange', () => {
		it('should accept values in range', () => {
			expect(assertInRange(5, 1, 10)).toBe(5);
			expect(assertInRange(1, 1, 10)).toBe(1);
			expect(assertInRange(10, 1, 10)).toBe(10);
		});

		it('should reject values below range', () => {
			expect(() => assertInRange(0, 1, 10)).toThrow('must be between');
		});

		it('should reject values above range', () => {
			expect(() => assertInRange(11, 1, 10)).toThrow('must be between');
		});

		it('should reject non-finite values', () => {
			expect(() => assertInRange(Infinity, 1, 10)).toThrow('finite number');
			expect(() => assertInRange(-Infinity, 1, 10)).toThrow('finite number');
			expect(() => assertInRange(NaN, 1, 10)).toThrow('finite number');
		});

		it('should use custom label', () => {
			expect(() => assertInRange(0, 1, 10, 'Page')).toThrow('Page');
		});
	});

	describe('assertNonEmpty', () => {
		it('should accept non-empty strings', () => {
			expect(assertNonEmpty('hello')).toBe('hello');
			expect(assertNonEmpty('  hello  ')).toBe('hello');
		});

		it('should reject empty strings', () => {
			expect(() => assertNonEmpty('')).toThrow('required');
			expect(() => assertNonEmpty('   ')).toThrow('required');
		});

		it('should enforce max length', () => {
			expect(() => assertNonEmpty('a'.repeat(101), 'Value', 100)).toThrow(
				'exceeds maximum length of 100',
			);
		});

		it('should accept strings within default max length', () => {
			expect(assertNonEmpty('a'.repeat(10000))).toBe('a'.repeat(10000));
		});

		it('should reject strings exceeding default max length', () => {
			expect(() => assertNonEmpty('a'.repeat(10001))).toThrow(
				'exceeds maximum length',
			);
		});
	});

	describe('assertValidBase64', () => {
		it('should accept valid Base64', () => {
			expect(assertValidBase64('SGVsbG8=')).toBe('SGVsbG8=');
			expect(assertValidBase64('AAAA')).toBe('AAAA');
			expect(assertValidBase64('AA==')).toBe('AA==');
		});

		it('should accept Base64 with whitespace', () => {
			expect(assertValidBase64('  SGVsbG8=  ')).toBe('SGVsbG8=');
		});

		it('should reject empty content', () => {
			expect(() => assertValidBase64('')).toThrow('required');
			expect(() => assertValidBase64('   ')).toThrow('required');
		});

		it('should reject invalid Base64 characters', () => {
			expect(() => assertValidBase64('not base64!!!')).toThrow('not valid Base64');
			expect(() => assertValidBase64('abc@def')).toThrow('not valid Base64');
		});

		it('should use custom label', () => {
			expect(() => assertValidBase64('', 'Document')).toThrow('Document');
		});
	});

	describe('assertFileSize', () => {
		it('should accept valid sizes', () => {
			expect(() => assertFileSize(1024)).not.toThrow();
			expect(() => assertFileSize(25 * 1024 * 1024)).not.toThrow();
			expect(() => assertFileSize(1)).not.toThrow();
		});

		it('should reject zero-length files', () => {
			expect(() => assertFileSize(0)).toThrow('empty');
		});

		it('should reject negative sizes', () => {
			expect(() => assertFileSize(-1)).toThrow('empty');
		});

		it('should reject oversized files with default limit', () => {
			expect(() => assertFileSize(26 * 1024 * 1024)).toThrow('exceeds');
			expect(() => assertFileSize(26 * 1024 * 1024)).toThrow('25 MB');
		});

		it('should respect custom max bytes', () => {
			expect(() => assertFileSize(1024, 512)).toThrow('exceeds');
		});

		it('should use custom label', () => {
			expect(() => assertFileSize(0, 25 * 1024 * 1024, 'PDF')).toThrow('PDF');
		});
	});

	describe('parseCommaSeparated', () => {
		it('should parse comma-separated values', () => {
			expect(parseCommaSeparated('a, b, c')).toEqual(['a', 'b', 'c']);
		});

		it('should handle single value', () => {
			expect(parseCommaSeparated('single')).toEqual(['single']);
		});

		it('should return empty array for empty input', () => {
			expect(parseCommaSeparated('')).toEqual([]);
			expect(parseCommaSeparated('  ')).toEqual([]);
		});

		it('should filter empty entries from commas', () => {
			expect(parseCommaSeparated('a,,b,  ,c')).toEqual(['a', 'b', 'c']);
		});

		it('should trim whitespace from entries', () => {
			expect(parseCommaSeparated('  a  ,  b  ')).toEqual(['a', 'b']);
		});

		it('should throw when only commas/whitespace present', () => {
			expect(() => parseCommaSeparated(',,,  , ')).toThrow(
				'contains no valid items',
			);
		});
	});
});
