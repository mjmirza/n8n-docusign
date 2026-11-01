# Changelog

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
