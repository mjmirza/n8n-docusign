# DocuSign n8n Node — Architecture Documentation

## Overview

Enterprise-grade n8n community node for the DocuSign eSignature REST API v2.1.
Covers ~390 operations across 85+ sub-resources organized into 12 categories.

## Project Structure

```
n8n-docusign/
├── credentials/
│   ├── DocuSignOAuth2Api.credentials.ts    # OAuth2 Authorization Code flow
│   └── DocuSignJwtApi.credentials.ts       # JWT Grant (service integration)
├── nodes/
│   └── DocuSign/
│       ├── DocuSign.node.ts                # Main action node
│       ├── DocuSignTrigger.node.ts         # Webhook trigger (DocuSign Connect)
│       ├── docusign.svg                    # Node icon
│       ├── transport.ts                    # HTTP client, retry, pagination, CRUD factory
│       ├── utils/
│       │   ├── descriptions.ts             # Shared field definitions, category/resource maps
│       │   ├── validators.ts               # Input validation (email, date, Base64, file size)
│       │   └── binaryHelpers.ts            # Document/image upload/download, chunked uploads
│       └── resources/
│           ├── envelope/                   # Envelope resource (10+ operations)
│           │   ├── envelope.operations.ts  # Operation dropdown definition
│           │   ├── envelope.fields.ts      # UI field definitions per operation
│           │   └── envelope.handler.ts     # Operation implementations
│           ├── template/                   # Template resource
│           ├── recipient/                  # Recipient resource
│           ├── document/                   # Document resource
│           └── ...                         # Additional resources per phase
├── tests/
│   ├── transport.test.ts                   # Transport layer tests
│   ├── validators.test.ts                  # Validator tests
│   ├── helpers/                            # Test utilities (mock context, etc.)
│   └── fixtures/                           # Mock API response fixtures
├── docs/                                   # This documentation
├── package.json
├── tsconfig.json
├── gulpfile.js                             # Icon copy task
└── jest.config.js
```

## Architecture Patterns

### 1. Category + Resource + Operation Selector

The n8n UI uses a three-level hierarchy:

```
Category: [Envelopes | Templates | Accounts | Users & Groups | ...]
  └─ Resource: [Envelope | Envelope Attachment | Envelope Custom Field | ...]
       └─ Operation: [Create | Get | Get Many | Update | Delete | ...]
```

Each resource is defined by three files:
- **`<resource>.operations.ts`** — `INodeProperties[]` defining the operation dropdown, filtered by `displayOptions.show.resource`
- **`<resource>.fields.ts`** — `INodeProperties[]` for operation-specific input fields
- **`<resource>.handler.ts`** — `async function handle<Resource>(ctx, operation, i)` with a switch/case per operation

### 2. Transport Layer (`transport.ts`)

Central HTTP client with:
- **Credential resolution**: Tries OAuth2 first, falls back to JWT
- **Automatic retry**: Exponential backoff + jitter for 429/502/503/504 errors
- **Error handling**: Parses DocuSign error formats into `NodeApiError` for proper n8n UI display
- **ID sanitization**: `assertSafeId()` — alphanumeric + hyphens/underscores only
- **Endpoint sanitization**: `sanitizeEndpoint()` — blocks path traversal and dangerous characters
- **Path builders**: `accountPath()`, `envelopePath()`, `templatePath()` for consistent URL construction
- **Pagination**: `docuSignGetAll()` handles DocuSign's offset-based pagination
- **CRUD factory**: `createCrudHandler()` generates standard handlers from configuration

### 3. Security Measures

| Measure | Implementation |
|---------|---------------|
| SSRF protection | Fixed base URLs only (demo/production) |
| Path traversal | `sanitizeEndpoint()` blocks `..` and dangerous characters |
| ID injection | `assertSafeId()` whitelist validation |
| Credential leaking | Raw values never included in error messages |
| Header injection | n8n's built-in auth handles headers |
| Timing attacks | `crypto.timingSafeEqual()` for webhook HMAC verification |
| Retry abuse | Max 3 retries, capped at 10s delay |
| Error truncation | `MAX_ERROR_LENGTH = 1000` prevents log bloat |

### 4. Binary Data Handling

- **Document download**: Returns `Buffer` via `encoding: null`, wrapped in `prepareBinaryData()`
- **Image upload**: Accepts binary from previous node or Base64 string
- **Chunked upload**: Multi-part upload for files > 25 MB (20 MB chunks)

### 5. Webhook Trigger (`DocuSignTrigger.node.ts`)

- Auto-manages DocuSign Connect configurations (create on activate, delete on deactivate)
- Verifies HMAC-SHA256 signatures using `crypto.timingSafeEqual()`
- Supports envelope and recipient events

## Authentication

### OAuth2 (Authorization Code Grant)
- Redirect-based flow with DocuSign consent screen
- Environment-aware URLs (demo vs production)
- Scopes: `signature extended`

### JWT (JSON Web Token Grant)
- Service-to-service integration (no user interaction)
- RSA private key signing
- User impersonation via `sub` claim

## API Categories & Resources

| Category | Resources | Operations |
|----------|-----------|------------|
| Envelopes | 23 sub-resources | ~100 |
| Templates | 11 sub-resources | ~55 |
| Account | 15 sub-resources | ~80 |
| Users & Groups | 8 sub-resources | ~50 |
| Billing | 4 sub-resources | ~15 |
| Connect | 1 sub-resource | ~10 |
| Folders | 1 sub-resource | ~4 |
| Signing Groups | 2 sub-resources | ~9 |
| PowerForms | 2 sub-resources | ~8 |
| Bulk Operations | 2 sub-resources | ~10 |
| Workspaces | 2 sub-resources | ~11 |
| Advanced | 9 sub-resources | ~25 |

## DocuSign API Reference

- Base URL (Demo): `https://demo.docusign.net/restapi/v2.1`
- Base URL (Prod): `https://www.docusign.net/restapi/v2.1`
- All endpoints: `/accounts/{accountId}/...`
- Auth (Demo): `https://account-d.docusign.com/oauth/...`
- Auth (Prod): `https://account.docusign.com/oauth/...`
- Rate limits: 3,000/hour, 500/30s burst
- Docs: https://developers.docusign.com/docs/esign-rest-api/reference/
