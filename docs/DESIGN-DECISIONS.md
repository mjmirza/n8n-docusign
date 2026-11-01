# Design decisions

Choices where the node deliberately differs from what a quick reading of an operation name
suggests. Every entry is checked against DocuSign's published OpenAPI specifications:

- eSignature v2.1: <https://raw.githubusercontent.com/docusign/OpenAPI-Specifications/master/esignature.rest.swagger-v2.1.json>
- eSignature v2: <https://raw.githubusercontent.com/docusign/OpenAPI-Specifications/master/esignature.rest.swagger-v2.json>

The route list the tests check against is `tests/fixtures/esign-v2.1-routes.json`, extracted
from the v2.1 file on 2026-11-01. Every operation in the picker is run against it by
`tests/every-operation.test.ts`.

## Account: List Recipient Names By Email calls the v2 API

The v2.1 specification has no `recipient_names` path. The v2 specification defines
`GET /v2/accounts/{accountId}/recipient_names`, so this one operation calls `/restapi/v2`.

## Cloud Storage: Get File is not offered

Neither specification has an endpoint that returns a cloud storage file's content. They define
only `.../cloud_storage/{serviceId}/folders` and `.../folders/{folderId}`, which list items.
Get File was removed from the picker in 3.0.0. A saved workflow that still uses it fails with a
message pointing to List Files instead of calling a URL that does not exist.

## Envelope Comment: Get downloads the transcript

The only comments endpoint in v2.1 is `GET .../envelopes/{envelopeId}/comments/transcript`,
which returns a PDF. Get returns that PDF as binary data.

## Account Password Rule: Get For User returns the signed-in user's rules

v2.1 defines `GET /v2.1/current_user/password_rules` and no per-user variant. The User ID field
is kept so saved workflows still validate, and the description says which rules come back.

## Envelope Attachment: Get on version 1 returns both earlier outputs

DocuSign returns the attachment file itself (`application/octet-stream`). 2.1.0 returned it as
binary with `attachmentId` and `fileName`; 3.0.0 put node version 1 back on the parsed response
(a JSON body as-is, otherwise the text under `data`). Each choice breaks workflows built on the
other release. Since 3.2.0 version 1 returns the union: the binary, `attachmentId`, `fileName`,
and 3.0.0's JSON fields. Version 2 returns the binary with `attachmentId` and `fileName` only.

## Template page rotation sends left or right

`pageRequest.rotate` accepts only `left` or `right`, each a 90 degree turn. The picker keeps its
values: 90 degrees clockwise sends `right`, counter-clockwise sends `left`, and 180 degrees sends
two `right` requests in order.

## Workspace folder items use DocuSign's flags and keys

`GET .../folders/{folderId}` takes `include_files` and `include_sub_folders`, not `type`, so the
older Type filter turns on the matching flag. `workspaceItem` uses `id` and `type`; Delete maps
the older `itemId` and `itemType` keys.

## Filters the spec has no parameter for

Template Get Many's Folder joins `folder_ids`. `GET connect/logs` has no status parameter, so the
Connect event log Status filter is applied to the returned entries.

## Custom fields: Delete sends the field in both lists

`DELETE .../custom_fields` takes `textCustomFields` and `listCustomFields` arrays. The node only
knows the field ID, and field IDs are unique across both kinds, so it names the ID in both.

## Retries: only reads repeat after a 5xx

Writes can append, for example attachments through `PUT .../attachments`, so POST, PUT, PATCH
and DELETE retry only on 429, which DocuSign rejects before processing.
