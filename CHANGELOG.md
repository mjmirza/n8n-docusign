# Changelog

## [2.0.1] - 2026-11-01

### Fixed
- DocuSign Trigger recognises its existing Connect configuration. DocuSign returns it inside a `configurations` list, which the check missed, so every restart registered a second subscription and events ran twice.
- Recipient Update sends Access Code, Client User ID, delivery method and the email notification. Before, only email, name, routing order and note reached DocuSign, so an access code set here was silently dropped.
- SMS delivery sends `deliveryMethod: SMS` and the phone as `{ countryCode, number }` on Envelope Create, Recipient Add and Update and Create From Template. Before, the phone went out as `{ phoneNumber }`, which DocuSign does not accept. Enter it as country code, a space, then the number, for example `+49 1701234567`.
- Envelope and template lock Update and Delete send the lock token in the `X-DocuSign-Edit` header. Before, it went in the body, which DocuSign ignores, so extending or releasing a lock failed.
- Template Document Delete calls `DELETE .../documents` with the document ID in the body. Template Recipient Create Preview posts to `.../templates/{id}/views/recipient_preview`. Envelope Publish posts to `connect/envelopes/publish/historical`. User Contact Create and Update send `contactList`.
- Include Documents on the trigger now also asks for documents in the JSON event data, so the PDFs arrive.
- JWT setup text names the Production consent host too and says to register a redirect URI.

### Changed
- Tests that asserted `true`, or only asserted inside a `catch`, now check the real result.
- README says most, not all, of the eSignature API is covered.

## [2.0.0] - 2026-11-01

### Breaking
- DocuSign Trigger needs the Connect HMAC key. Add it under Options, HMAC Secret, from DocuSign Admin, Connect, Connect Keys. Before, the trigger generated a random secret DocuSign never knew, so every signed event was rejected. Now activation fails with a clear message when the key is missing, and any unsigned or mismatched call gets HTTP 401.
- Envelope Delete moves the envelope to the recycle bin and returns `{ envelopeId, deleted: true }`. Before, it tried to void the envelope, which fails for drafts and completed envelopes and returned the void response.
- POST and PATCH calls are no longer repeated after a 502, 503 or 504, because DocuSign may already have created the envelope. They still retry on 429. GET, PUT and DELETE keep retrying on all transient codes.

### Fixed
- JWT credential now signs in. It builds the RS256 JWT grant, exchanges it at `/oauth/token` and sends the bearer token. Before, it had no authentication step, so every JWT request was rejected.
- Requests go to the account's own DocuSign platform (na2, na3, eu and others), discovered from `/oauth/userinfo`. Before, every production call went to `www.docusign.net`. Only `https://*.docusign.net` hosts are accepted.
- Trigger registers events in the `events` list that matches the event names it offers. Before, it sent them as legacy envelope and recipient events, which DocuSign does not accept in that form.
- Trigger checks every `x-docusign-signature-N` header against every configured key, so key rotation works. Several keys can be separated with commas.
- Downloads return the real file bytes. Before, the binary request option was ignored and documents could arrive corrupted.
- Uploads read file content with `getBinaryDataBuffer`. Before, envelope, template, template document, attachment and workspace uploads sent the storage reference instead of the file when n8n stores binary data on disk or S3.
- Create From Template sends Access Code, the email notification subject and body, and SMS delivery with the phone number. Before, only role name, email, name and client user ID reached DocuSign.
- Chunked upload parts are sent as JSON with base64 data and committed with `?action=commit`. Console view posts to the account level `views/console`. Principal and agent authorization lists use `/authorizations` and `/authorizations/agent`.
- Retries also recognise the status on `NodeApiError` (`httpCode`).
- API errors keep the index of the item that failed.

### Changed
- CI runs on Node 22 and 24 and enforces the coverage floor. The thresholds now match measured coverage instead of unreached targets.
- Tests assert the actual request URL, body and options, and cover each fix above.

## [1.1.0] - 2026-11-01

### Changed
- License. The package is now MIT. Before, it used the custom Fair Use Code License, which blocked n8n verification.
- Errors. Every failure inside the node now surfaces as `NodeApiError` or `NodeOperationError` with the item index. Before, about 50 code paths threw a plain `Error`, which n8n shows without the DocuSign status and reason.
- Retries wait with the `sleep` helper from `n8n-workflow`. Before, they used `setTimeout`, which n8n verification rejects.
- Icons. The node and both credentials use light and dark SVG icons. Before, the node used a single PNG and the credentials had none.
- Font color on tabs and watermarks is now a dropdown of the values DocuSign accepts. Before, it was free text that suggested hex codes the API rejects.
- eNote operation hints read "Get the enote configuration" so they pass n8n sentence case checks.
- Trigger event names drop the dash, for example Envelope Completed. The event values sent to DocuSign are unchanged.
- Options and collections are sorted alphabetically, email fields show a placeholder, and secret fields are masked. Parameter names and values are unchanged, so saved workflows keep working.
- The published package is smaller, 254 files instead of 999, because type declarations and source maps are no longer shipped.
- Dev toolchain. `n8n-workflow` 2.45.4 (was 1.120.9), Jest 30, TypeScript 5.9.3. The `overrides` block is gone, it had no effect for community installs and n8n verification rejects it.

### Fixed
- Envelope Document and Envelope Recipient showed no operations when picked. Their operations now appear, and existing `document` and `recipient` values keep working.
- The DocuSign Trigger no longer hides a failed Connect lookup or cleanup. It now logs a warning with the Connect ID.

### Docs
- README rewritten with setup steps, a full operations table generated from the node, and the release flow.

## [1.0.4] - 2026-10-31

### Changed
- Publisher. Releases now ship from the npm account `nex8n`. Before, they were published by hand from the `contentapis` account. Same package name, so existing installs update normally.
- Releases are signed. Each version is published from GitHub Actions with an npm provenance statement that links the tarball to the exact source commit. Before, releases had no provenance.
- The repository is public and the README states the license up front, plus an `AGENTS.md` that tells AI tools what the license allows.

### Security
- Updated transitive dev dependencies (handlebars, form-data, js-yaml, brace-expansion, browserslist). The critical and most high advisories in the build toolchain are gone. Nothing changes in the published node code.

## [1.0.3]
- Last release published from the `contentapis` account.
