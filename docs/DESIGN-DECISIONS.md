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

## Envelope Attachment: Get output depends on node version

DocuSign returns the attachment file itself (`application/octet-stream`). Node version 2
returns it as binary data. Node version 1, which saved workflows use, keeps the earlier JSON
response so their downstream steps keep working.

## Custom fields: Delete sends the field in both lists

`DELETE .../custom_fields` takes `textCustomFields` and `listCustomFields` arrays. The node only
knows the field ID, and field IDs are unique across both kinds, so it names the ID in both.

## Retries: only reads repeat after a 5xx

Writes can append, for example attachments through `PUT .../attachments`, so POST, PUT, PATCH
and DELETE retry only on 429, which DocuSign rejects before processing.
