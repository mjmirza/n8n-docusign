# AGENTS.md

Guidance for any AI agent or coding assistant working in this repository.

## License

This project is MIT licensed, see LICENSE. Keep the copyright notice and the
trademark notice in docs/TRADEMARKS.md intact in any copy or fork.

## Layout

Each DocuSign resource lives in `nodes/DocuSign/resources/<resource>/` as three
files. `<resource>.operations.ts` holds the operation picker, `<resource>.fields.ts`
holds the inputs, and `<resource>.handler.ts` makes the API calls through
`nodes/DocuSign/transport.ts`.

## Rules that keep the package verifiable on n8n

The package must pass `npx @n8n/scan-community-package n8n-nodes-docusigns` with
zero findings. In practice that means the following.

- Throw `NodeApiError` or `NodeOperationError` inside every catch block, never a raw `Error`.
- Use `sleep` from `n8n-workflow` instead of `setTimeout`.
- No runtime dependencies, no Node built-ins such as `fs` or `http`, no `overrides` field.
- Keep option and collection items alphabetised, and mark secrets with `typeOptions.password`.
- Never change an existing parameter `name` or option `value`. Saved workflows depend on them.

## Checks before a pull request

Use Node 22 or 24. The `n8n-workflow` dev dependency builds a native module that
does not compile on newer Node releases yet.

```bash
npm ci
npm run build
npx tsc --noEmit
npm test
```

## Releases

Bump `version` in package.json, add a CHANGELOG entry, merge, then push a tag
`vX.Y.Z` on the merge commit. The Publish workflow builds, tests and publishes
with npm provenance as the `nex8n` account.

## Contact

support@next8n.com or a GitHub issue.
