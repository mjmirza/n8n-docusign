# n8n-nodes-docusigns

> **License.** Source-available under the [Fair Use Code License](https://github.com/mjmirza/n8n-docusign/blob/master/LICENSE). Free to use in your own workflows. Copying the code, derivative works, AI-generated clones, and commercial redistribution need written consent. Commercial licensing and setup help: [next8n.com](https://next8n.com).

n8n community node for [DocuSign eSignature REST API v2.1](https://developers.docusign.com/docs/esign-rest-api/) — 80 resources, 330+ operations, webhook triggers.

Built by [next8n](https://next8n.com) | [npm](https://www.npmjs.com/package/n8n-nodes-docusigns) | [DocuSign API Reference](https://developers.docusign.com/docs/esign-rest-api/reference/)

## Installation

```bash
# In n8n: Settings → Community Nodes → n8n-nodes-docusigns

# Or manually:
cd ~/.n8n && npm install n8n-nodes-docusigns
```

## Connecting DocuSign

### OAuth2 (Recommended)

1. Create an app at [DocuSign Admin → Apps and Keys](https://admindemo.docusign.com/apps-and-keys)
2. Copy **Integration Key** (Client ID) and generate a **Secret Key**
3. Add your n8n OAuth callback as a **Redirect URI**: `https://your-n8n.com/rest/oauth2-credential/callback`
4. In n8n: **Credentials → DocuSign OAuth2 API** → paste Client ID + Secret → click **Sign in with DocuSign**

| Field | Where to find it |
|-------|-----------------|
| Client ID | DocuSign Admin → Apps and Keys → Integration Key |
| Client Secret | DocuSign Admin → Apps and Keys → Secret Keys → Add Secret Key |
| Redirect URI | n8n generates this — copy from the credential form and add to DocuSign app |

### JWT (Server-to-server)

1. Same app setup as OAuth2, but also **Generate RSA** keypair under Service Integration
2. Grant consent once: `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_KEY&redirect_uri=https://www.docusign.com`
3. In n8n: **Credentials → DocuSign JWT API** → paste Integration Key, User ID, RSA Private Key, Account ID

| Field | Where to find it |
|-------|-----------------|
| Integration Key | DocuSign Admin → Apps and Keys |
| User ID | DocuSign Admin → Apps and Keys → User ID (GUID) |
| RSA Private Key | Generated via "Generate RSA" button → save the private key |
| Account ID | DocuSign Admin → Apps and Keys → API Account ID |

## Architecture

```
credentials/
  DocuSignOAuth2Api.credentials.ts    # OAuth2 Authorization Code flow
  DocuSignJwtApi.credentials.ts       # JWT Grant flow
nodes/DocuSign/
  DocuSign.node.ts                    # Main action node (80 resources)
  DocuSignTrigger.node.ts             # DocuSign Connect webhook trigger
  transport.ts                        # HTTP client, retry, pagination, CRUD factory
  utils/
    descriptions.ts                   # Shared field definitions, category/resource maps
    validators.ts                     # Input validation (email, date, Base64, file size)
    binaryHelpers.ts                  # Document/image upload/download helpers
  resources/
    envelope/                         # operations.ts, fields.ts, handler.ts
    template/                         # (same 3-file pattern x 80 resources)
    ...
tests/
  transport.test.ts                   # Transport layer tests
  transport-runtime.test.ts           # Runtime function tests (mock context)
  validators.test.ts                  # Validator tests
  security.test.ts                    # 72 security tests
  error-handling.test.ts              # 106 error handling tests
  compliance.test.ts                  # 47 compliance tests
  branch-coverage.test.ts             # Exhaustive branch coverage
  phase[1-9]-handlers.test.ts         # Per-phase handler tests
```

Each resource follows: `operations.ts` (dropdown options) → `fields.ts` (UI inputs) → `handler.ts` (API calls).

## Resources (80)

| Category | Resources | Ops |
|----------|-----------|-----|
| **Envelopes** | Envelope, Recipient, Recipient Tab, Document, View, Custom Field, Form Data, Lock, Attachment, Template, Document Tab, Document Field, Email Setting, Document Visibility, Workflow, Transfer Rule, Consumer Disclosure, HTML Definition, Comment, Document Generation, Publish, Tabs Blob, Responsive HTML Preview | ~140 |
| **Templates** | Template, Document, Recipient, Recipient Tab, Custom Field, Document Field, Document Tab, Document Visibility, Lock, View, HTML Definition | ~55 |
| **Account** | Account, Brand, Permission Profile, Custom Field, Tab Setting, Consumer Disclosure, Password Rule, Watermark, Signature, Seal Provider, Signature Provider, eNote Config, Favorite Template, Identity Verification | ~82 |
| **Users & Groups** | User, Profile, Custom Setting, Signature, Group, Group User, Group Brand, Contact, Authorization | ~48 |
| **Signing Groups** | Signing Group, Signing Group User, Custom Tab | ~14 |
| **Connect** | Connect Configuration | ~10 |
| **PowerForms** | PowerForm, PowerForm Data | ~8 |
| **Folders** | Folder | ~4 |
| **Workspaces** | Workspace, Workspace Item | ~11 |
| **Billing** | Billing Plan, Invoice, Payment, Payment Gateway | ~13 |
| **Bulk Ops** | Bulk Envelope, Chunked Upload | ~11 |
| **Cloud Storage** | Cloud Storage | ~4 |
| **Diagnostics** | Request Log, Diagnostic Resource, Diagnostic Service | ~7 |
| **Compliance** | BCC Email Archive | ~4 |
| **Notary** | Notary, Jurisdiction, Journal | ~9 |

## Security

| Feature | Detail |
|---------|--------|
| SSRF | Fixed base URLs (demo/production only) |
| ID Injection | `assertSafeId()` — alphanumeric + hyphens only, no raw values in errors |
| Endpoint Sanitization | `sanitizeEndpoint()` — URL-decoded traversal blocked |
| Prototype Pollution | Allowlist validation on recipient types, tab types, logo types, scope |
| Webhook HMAC | SHA-256 + `timingSafeEqual()` |
| Retry | Exponential backoff + jitter, 429/502/503/504 only |
| Errors | `NodeApiError`, 1000-char truncation, no PII leakage |

## Tests

```bash
npm test              # 884 tests, 0 failures
npm run test:coverage # 100% functions, 100% lines per handler
```

| Suite | Tests | Coverage |
|-------|-------|----------|
| Transport | 120 | 100% lines |
| Phase 1-9 Handlers | 609 | 100% lines per handler |
| Security | 72 | ID injection, prototype pollution, SSRF, credential leakage |
| Error Handling | 106 | All error codes, retry, JSON parse, missing credentials |
| Compliance | 47 | GDPR, OWASP, n8n standards, input validation |
| Branch Coverage | ~50 | || fallback paths, conditional branches |

## Development

```bash
npm install          # Install dependencies
npm run dev          # Watch mode
npm run build        # Production build (tsc + gulp icons)
npm test             # Run all tests
npm run test:coverage # Coverage report
npm run lint         # Lint
```

## Publishing

```bash
npm run prepublishOnly  # Swaps README → npm version, builds
npm publish             # Publishes to npm
npm run postpublish     # Restores dev README
```

## License

[FUCL (Fair Use Code License)](LICENSE)
