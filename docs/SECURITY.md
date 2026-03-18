# Security Model

## Input Validation

### ID Sanitization (`assertSafeId`)
- Whitelist: `[a-zA-Z0-9_-]` only
- Length: 1-255 characters
- Raw values NEVER included in error messages
- Applied to: Account ID, Envelope ID, Template ID, Document ID, Recipient ID, User ID, all sub-resource IDs

### Endpoint Sanitization (`sanitizeEndpoint`)
- Blocks path traversal (`..` patterns)
- Character whitelist: `[a-zA-Z0-9\-_/.[\]?&=%,]`
- Leading slashes stripped

### Email Validation (`assertValidEmail`)
- RFC 5322 basic format check
- Max 254 characters
- Trimmed and validated before API calls

### File Size Validation (`assertFileSize`)
- Default max: 25 MB (DocuSign document limit)
- Zero-length file rejection
- Recommends chunked uploads for larger files

### Base64 Validation (`assertValidBase64`)
- Character set check: `[A-Za-z0-9+/=]`
- Empty content rejection

## Network Security

### SSRF Protection
- Fixed base URLs only: `demo.docusign.net` or `www.docusign.net`
- No user-controlled URL construction
- Environment parameter validated against whitelist

### Request Security
- HTTPS only (enforced by base URLs)
- 30-second timeout on all requests
- Retry limited to 3 attempts with exponential backoff (max 10s)
- Only retries on 429/502/503/504

## Credential Security

- OAuth2 tokens managed by n8n's built-in OAuth2 flow
- JWT private keys stored with `typeOptions: { password: true }`
- No credentials logged or included in error messages
- Credential type auto-detected (OAuth2 first, then JWT fallback)

## Webhook Security

- HMAC-SHA256 signature verification on incoming webhooks
- `crypto.timingSafeEqual()` for constant-time comparison (prevents timing attacks)
- Random secret generated per webhook registration
- Signature header: `X-DocuSign-Signature-1`

## Error Handling

- `NodeApiError` used for proper n8n UI error display
- Error messages capped at 1,000 characters
- Maximum 10 error items parsed from array responses
- Multiple DocuSign error formats handled (errorCode/message, error/error_description, errors array, title/detail)

## Dependencies

- Zero runtime dependencies (only `peerDependencies: { "n8n-workflow": "*" }`)
- All HTTP via n8n's built-in `httpRequestWithAuthentication`
- Crypto via Node.js built-in `crypto` module
