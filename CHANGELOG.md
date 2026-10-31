# Changelog

## [1.0.4] - 2026-10-31

### Changed
- Publisher. Releases now ship from the npm account `nex8n`. Before, they were published by hand from the `contentapis` account. Same package name, so existing installs update normally.
- Releases are signed. Each version is published from GitHub Actions with an npm provenance statement that links the tarball to the exact source commit. Before, releases had no provenance.
- The repository is public and the README states the license up front, plus an `AGENTS.md` that tells AI tools what the license allows.

### Security
- Updated transitive dev dependencies (handlebars, form-data, js-yaml, brace-expansion, browserslist). The critical and most high advisories in the build toolchain are gone. Nothing changes in the published node code.

## [1.0.3]
- Last release published from the `contentapis` account.
