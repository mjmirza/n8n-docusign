/**
 * Input validation utilities for DocuSign API parameters.
 * All validators throw descriptive errors without leaking raw values.
 */

/**
 * Validate an email address format.
 */
export function assertValidEmail(email: string, label = 'Email'): string {
	const trimmed = email.trim();
	if (!trimmed) {
		throw new Error(`${label} is required`);
	}

	// Basic RFC 5322 check — not exhaustive but catches common issues
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
		throw new Error(`${label} is not a valid email address`);
	}

	if (trimmed.length > 254) {
		throw new Error(`${label} exceeds maximum length of 254 characters`);
	}

	return trimmed;
}

/**
 * Validate an ISO 8601 date string.
 */
export function assertValidDate(value: string, label = 'Date'): string {
	const trimmed = value.trim();
	if (!trimmed) {
		throw new Error(`${label} is required`);
	}

	const date = new Date(trimmed);
	if (isNaN(date.getTime())) {
		throw new Error(`${label} is not a valid date`);
	}

	return date.toISOString();
}

/**
 * Validate that a numeric value is within bounds.
 */
export function assertInRange(
	value: number,
	min: number,
	max: number,
	label = 'Value',
): number {
	if (!Number.isFinite(value)) {
		throw new Error(`${label} must be a finite number`);
	}
	if (value < min || value > max) {
		throw new Error(`${label} must be between ${min} and ${max}`);
	}
	return value;
}

/**
 * Validate a non-empty string with optional length bounds.
 */
export function assertNonEmpty(
	value: string,
	label = 'Value',
	maxLength = 10_000,
): string {
	const trimmed = value.trim();
	if (!trimmed) {
		throw new Error(`${label} is required`);
	}
	if (trimmed.length > maxLength) {
		throw new Error(
			`${label} exceeds maximum length of ${maxLength} characters`,
		);
	}
	return trimmed;
}

/**
 * Validate a Base64-encoded string.
 */
export function assertValidBase64(value: string, label = 'Content'): string {
	const trimmed = value.trim();
	if (!trimmed) {
		throw new Error(`${label} is required`);
	}

	// Check for valid Base64 characters
	if (!/^[A-Za-z0-9+/\r\n]+=*$/.test(trimmed.replace(/\s/g, ''))) {
		throw new Error(`${label} is not valid Base64`);
	}

	return trimmed;
}

/**
 * Validate file size in bytes against DocuSign limits.
 * DocuSign allows up to 25 MB per document (non-chunked).
 */
export function assertFileSize(
	sizeBytes: number,
	maxBytes = 25 * 1024 * 1024,
	label = 'File',
): void {
	if (sizeBytes <= 0) {
		throw new Error(`${label} is empty`);
	}
	if (sizeBytes > maxBytes) {
		const maxMB = Math.round(maxBytes / (1024 * 1024));
		throw new Error(
			`${label} exceeds the maximum size of ${maxMB} MB. Use chunked uploads for larger files.`,
		);
	}
}

/**
 * Validate a comma-separated list of values and return as array.
 */
export function parseCommaSeparated(
	value: string,
	label = 'List',
): string[] {
	if (!value || !value.trim()) return [];

	const items = value
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	if (items.length === 0) {
		throw new Error(`${label} contains no valid items`);
	}

	return items;
}
