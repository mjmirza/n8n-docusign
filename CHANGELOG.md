# Changelog

## [3.5.0] - 2026-11-01

### Fixed
- Version 3 nodes output list responses with empty result arrays as in 3.3.0 (a 3.4.0-only change, see the README upgrade table); the 3.4.0 rule now applies to version 4 only, and counts a response as empty only when everything beside the arrays is paging or ID metadata.
- Tabs on node versions 1 to 3 send the request 3.3.0 sent: saved No anchor options, Size 12 and Left alignment are left out.
- An attached Connect HMAC credential that fails to load rejects calls instead of falling back to the deprecated HMAC Secret option.
- An existing Connect subscription is reused only when its events, format, delivery mode and document settings match; otherwise a new one is registered.
- Connect registration sends `configurationType`, `deliveryMode` and `enableLog`, which DocuSign requires.
- Revoke User Authorizations wraps the documented array in `{ authorizations: [...] }`.
- Contact Emails sends a list of address strings.
- Request bodies use the spec field names: `customFieldType`, `eNoteConfigured`, template `documents`, publish `envelopes`, `allowApiSequentialSigning`, `allowVaulting`, and the user profile address fields.
- On node version 4, Workspace Update File sends DocuSign's metadata update without file content, as the spec defines; earlier versions send the request they sent.
- Envelope attachment Replace sends the attachment ID it replaces; brand logo uploads send `Content-Disposition`, resource uploads send multipart `file.xml`.
- On node version 4, an ID check sets `requireIdLookup` unless No was chosen; earlier versions send what 3.4.0 sent. Phone Auth sends `phoneAuthentication`; Witness For and group lists are sent in the spec shape.
- JSON inputs accept an object as well as text everywhere.
- Reminder frequency on its own turns reminders on.
- The trigger checks for an HMAC key before reusing a subscription.

### Added
- Node version 4, the default for new nodes: empty-list output, Folder List Items includes the items, and tabs send a chosen No, Left alignment and any size.
- Anchor Match Whole Word and Font Size offer a DocuSign or Account Default choice, the default.

### Removed
- Folder List Items Count, folder Search Text, and the Auto Stamp and Confirm Initial Envelope Send tab settings; DocuSign does not define them, so they were never applied.

### Security
- Access code fields are masked in the editor.


## [3.4.0] - 2026-11-01

### Fixed
- The trigger fails closed: a signed payload must name a subscribed event and carry this trigger's Connect configuration ID, otherwise it is ignored with HTTP 200.
- Node version 3 outputs no items for a list operation whose response holds only empty result arrays, such as `{ groups: [] }`, not just for bare empty arrays.
- Anchored tabs send the chosen Anchor Match Whole Word, Case Sensitive and Ignore If Not Present values, including No.
- Anchor Horizontal Alignment offers Left and Right only, the values DocuSign defines; Center is rejected with a message.


## [3.3.0] - 2026-11-01

### Fixed
- Envelope and template Create with only reminders send `expirations.expireEnabled: false` (the account default), so DocuSign no longer sets expiry to 0, which expired the envelope the next day. Notification updates do the same, and setting a value without its enable flag turns the block on.
- The trigger ignores signed events it did not subscribe to and events from another Connect configuration, answering 200 so DocuSign does not retry.
- A recipient's Email Language is sent on its own, without needing a custom subject or body.
- The Connect event log Status description lists envelope statuses and points failed deliveries to Get Event Failures.

### Added
- Node version 3, the default for new nodes: a list with no results outputs no items. Saved nodes on versions 1 and 2 keep the count item.


## [3.2.0] - 2026-11-01

### Fixed
- Envelope Attachment Get on node version 1 returns the binary and fields of 2.1.0 plus the JSON fields of 3.0.0, so workflows built on either release keep working.
- Template page rotation sends DocuSign's `left` or `right`; 180 degrees is two right turns.
- Workspace folder list sends `include_files` and `include_sub_folders` instead of an unsupported `type`; Delete sends `id` and `type`, converting `itemId` and `itemType`.
- Chunked Upload Update defaults Chunk Index to 1, since Create already uploads part 0.
- Phone numbers written as `+14155550100` are split into country code and number without needing a space.
- Retries read `Retry-After` from n8n's wrapped error (`error.cause.response.headers`) as well as raw errors.
- Template Get Many sends Folder as `folder_ids`; the Connect event log Status filter is applied to the returned logs instead of an unsupported query parameter.
- The npm package includes `docs/TRADEMARKS.md`.

### Added
- Include Files and Include Sub Folders filters on workspace folder list.

### Changed
- Tests reject query parameters the spec does not define for a route, and the every-operation sweep fails when an operation produces an error item.


## [3.1.0] - 2026-11-01

### Fixed
- Envelope Attachment Get returns the file as binary data on node version 1 again, the output 2.1.0 shipped. 3.0.0 had put version 1 back on JSON, which broke 2.1.0 workflows.
- Template Update Notification Settings sends any expiration or reminder field set on its own, and keeps 0 as 0 instead of replacing it with a default.
- Template Create SMS signers send `SMS` and the structured phone number.
- Return All follows every page, and raises an error at a 10,000-page ceiling instead of silently returning part of the list.
- When the trigger's webhook URL changes, it deletes the old Connect subscription before creating the new one, so the old URL stops receiving events.
- The test setup's spec-route check throws instead of calling `expect`, so `expect.hasAssertions()` still catches a test whose error path never ran. Catch-only tests that had no guard now declare `expect.assertions(1)`.

### Added
- Phone Number on the template Create signer.
- List Items, Radios, Group Name and Formula on envelope and template recipient tabs, sent through to DocuSign.


## [3.0.0] - 2026-11-01

### Breaking
- The DocuSign node has a version 2. Saved nodes stay on version 1. On version 1, Envelope Attachment Get again returns DocuSign's JSON response, as before 2.1.0. On version 2 it returns the file as binary data. A 2.1.0 workflow on version 1 that reads the binary output needs its node switched to version 2.
- Cloud Storage Get File is removed from the picker. DocuSign has no endpoint for it, so it never worked. Saved workflows that use it stop with a message pointing to List Files.

### Added
- Envelope picker: Get Notification Settings, List Audit Events, List Status Changes and Update Notification Settings. The handlers existed but could not be selected.
- Group Get Many: Return All, plus Count, Start Position, Group Type, Search Text and Include User Count filters. Off by default, so existing workflows still send one request.
- Envelope and template recipient tab Update: Send Empty and No Values, off by default. When on, the update sends cleared text and No values, so it can unlock a tab or turn Required off.
- Phone Number on envelope recipient Update and on template recipient Create and Update, sent in DocuSign's SMS shape.
- `npm run lint:n8n` runs n8n's verification scanner on the source and the packed package. CI and the publish workflow run it, so a release n8n would reject is never published.
- `docs/DESIGN-DECISIONS.md` records where the node follows DocuSign's API rather than an operation's name, with the spec evidence.

### Fixed
- Connect Configuration Update calls `PUT /connect` with the configuration's ID in the body, and Publish to Connect is a POST.
- Envelope and template custom field Delete send the field ID list to `.../custom_fields`.
- List Recipient Names By Email calls the v2 API, the only version that has the endpoint.
- List Status Changes maps the Filters to DocuSign's query names, the same as Get Many.
- Template recipient SMS sends `SMS` and the phone shape.
- Recipient Add checks the Recipient ID for unsafe characters.
- The README no longer claims every ID is validated; it says which IDs are checked.

### Changed
- Every request any test sends must match a method and path in DocuSign's v2.1 spec. Every operation in the picker is run, and its JSON input must reach the request body.

## [2.1.0] - 2026-11-01

### Added
- **DocuSign Connect HMAC API** credential for the trigger's HMAC key. Credentials are stored encrypted and are not part of workflow exports, so sharing a workflow no longer shares the key that signs DocuSign events. The trigger uses the credential when one is attached and falls back to the old Options > HMAC Secret field, now marked deprecated, so existing workflows keep working.

### Fixed
- Envelope Update sends Purge State, Status, Voided Reason, Message Lock, Recipients Lock and Brand ID. Before, only the email subject and body were sent and every other field was silently dropped. Voiding without a reason now stops with a clear message.
- Writes are not repeated after a 502, 503 or 504. Before, PUT and DELETE were retried, and a PUT that had already added an attachment added it a second time. Only GET and HEAD retry on those codes; every method still retries on 429.
- The trigger no longer creates a duplicate Connect subscription when the lookup fails for a reason other than "not found", and keeps the stored subscription ID when cleanup fails, so the next deactivation can still remove it.
- Corrected routes, checked against the DocuSign v2.1 OpenAPI spec:
  - Folder List Items reads `folders/{folderId}`.
  - Workspace folder list and delete use the folder URL.
  - User profile image uses `profile/image`.
  - Attachment Delete sends the ID list to `attachments`.
  - Envelope Template Delete is scoped to a document; Document ID now shows for Delete.
  - Password Rules Get For User reads `current_user/password_rules`, which returns the signed-in user's rules.
  - Diagnostics call `/restapi/service_information` and `/restapi/v2.1`.
- Envelope Attachment Get and Envelope Comment Get return the file as binary output (`data`). Comments come from the PDF transcript, the only comments endpoint DocuSign provides.
- Update Notification Settings sends expirations and reminders as nested objects.
- Choosing Email as the delivery method on a recipient update now switches an SMS recipient back to email.

### Changed
- Security, compliance, transport and verification tests require an assertion in every test, and the tests that relied on a catch block now trigger the error they check.

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
- Tests that asserted `true` now check the real result, and `tests/error-handling.test.ts` requires an assertion in every test. The catch-only tests in other files were fixed in 2.1.0.
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
