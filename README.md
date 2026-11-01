<p align="center">
  <img src="https://raw.githubusercontent.com/mjmirza/n8n-docusign/master/docs/images/docusign-node.png" alt="DocuSign node icon" width="96" height="96" />
</p>

# n8n-nodes-docusigns

Send, track and manage DocuSign envelopes from any n8n workflow, without writing API code.

[![npm version](https://img.shields.io/npm/v/n8n-nodes-docusigns)](https://www.npmjs.com/package/n8n-nodes-docusigns)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-docusigns)](https://www.npmjs.com/package/n8n-nodes-docusigns)
[![CI](https://img.shields.io/github/actions/workflow/status/mjmirza/n8n-docusign/ci.yml?branch=master&label=CI)](https://github.com/mjmirza/n8n-docusign/actions/workflows/ci.yml)
[![License MIT](https://img.shields.io/badge/license-MIT-green)](https://github.com/mjmirza/n8n-docusign/blob/master/LICENSE)
[![npm provenance](https://img.shields.io/badge/npm-signed%20provenance-brightgreen)](https://www.npmjs.com/package/n8n-nodes-docusigns#provenance)

## What you get

- **Contracts go out on their own.** A new deal, hire or order in another tool creates and sends the DocuSign envelope, so nobody copies names and emails by hand.
- **You hear the moment someone signs.** The DocuSign Trigger fires on completed, declined, voided and nine other events, so the next step starts within seconds instead of after someone checks the inbox.
- **Signed PDFs land where they belong.** Download completed documents as n8n binary data and store them in your drive, CRM or archive in the same workflow.
- **Templates do the heavy lifting.** Create envelopes from your existing DocuSign templates and fill the recipient roles from workflow data.
- **Most of the eSignature API is there when you need it.** Over 80 resources and 350 operations cover envelopes, templates, users, groups, PowerForms, Connect, billing and more.
- **Failures are readable.** API errors show the DocuSign status code and reason in n8n. Reads retry transient errors with backoff, and writes retry only on rate limits so nothing is created twice. Every request path is checked for path traversal and unsafe characters before it leaves n8n.

## From install to first signed envelope

1. In n8n open **Settings**, then **Community Nodes**, choose **Install**, enter `n8n-nodes-docusigns` and confirm.
2. Create a **DocuSign OAuth2 API** credential (steps below), pick **Demo / Sandbox** for a first test and click **Sign in with DocuSign**.
3. Add the **DocuSign** node, set **Category** to Envelopes, **Resource** to Envelope and **Operation** to Create From Template.
4. Pick your account, paste a template ID, map one signer email and name, and run the node.
5. The output holds the new `envelopeId` and status `sent`, and the signer receives the email from DocuSign.

Add a **DocuSign Trigger** with the event Envelope Completed to continue the workflow once everyone has signed.

## Credentials

Both credentials start from an app in DocuSign Apps and Keys. Use the [demo account page](https://admindemo.docusign.com/apps-and-keys) for testing and the [production page](https://admin.docusign.com/apps-and-keys) for live accounts.

### OAuth2 (recommended)

1. In Apps and Keys choose **Add App and Integration Key** and copy the **Integration Key**.
2. Under **Authentication** add a **Secret Key** and copy it once.
3. Under **Redirect URIs** add the OAuth callback URL shown in the n8n credential form.
4. In n8n create **DocuSign OAuth2 API**, paste the key and secret, choose the environment and sign in.

Reference. [DocuSign Authorization Code Grant](https://developers.docusign.com/platform/auth/authcode/)

### JWT (server to server)

1. Use the same app, then under **Service Integration** choose **Generate RSA** and save the private key.
2. Copy your **User ID** and **API Account ID** from the top of Apps and Keys.
3. Add a **Redirect URI** to the app, then grant consent once by opening the consent URL shown in the n8n credential form while logged in as that user, with your integration key and that redirect URI. Use `account-d.docusign.com` for Demo and `account.docusign.com` for Production.
4. In n8n create **DocuSign JWT API** and paste the Integration Key, User ID, private key and Account ID.

Reference. [DocuSign JWT Grant](https://developers.docusign.com/platform/auth/jwt/)

## Operations

The action node groups 80 resources into areas. Pick an area, a resource, then an operation.

| Area | Resource | Operations |
|---|---|---|
| Envelopes | Envelope | Create, Create From Template, Delete, Download Documents, Get, Get Embedded Signing URL, Get Many, Get Notification Settings, List Audit Events, List Status Changes, Send, Update, Update Notification Settings, Void |
| Envelopes | Envelope Attachment | Create / Update, Delete, Get, Get Many |
| Envelopes | Envelope Comment | Get |
| Envelopes | Envelope Consumer Disclosure | Get, Get by Language |
| Envelopes | Envelope Custom Field | Create, Delete, Get Many, Update |
| Envelopes | Envelope Document | Download, Get Many |
| Envelopes | Envelope Document Field | Create, Delete, Get Many, Update |
| Envelopes | Envelope Document Tab | Create, Delete, Get, Get by Page, Update |
| Envelopes | Envelope Document Visibility | Get, Update, Update All Recipients |
| Envelopes | Envelope Email Setting | Create, Delete, Get, Update |
| Envelopes | Envelope Form Data | Get |
| Envelopes | Envelope HTML Definition | List, Get Document |
| Envelopes | Envelope Lock | Create, Delete, Get, Update |
| Envelopes | Envelope Publish | Create Historical |
| Envelopes | Envelope Recipient | Add, Delete, Get Many, Update |
| Envelopes | Envelope Recipient Tab | Create, Delete, Get Many, Update |
| Envelopes | Envelope Template | Apply, Apply to Document, Delete, Get Many, List by Document |
| Envelopes | Envelope Transfer Rule | Create, Delete, Get Many, Update, Update Rules |
| Envelopes | Envelope View | Create Console View, Create Correct View, Create Edit View, Create Recipient View, Create Sender View, Create Shared Recipient View, Delete Correct View |
| Envelopes | Envelope Workflow | Create Workflow Step, Delete Delayed Routing, Delete Scheduled Sending, Delete Workflow, Delete Workflow Step, Get Delayed Routing, Get Scheduled Sending, Get Workflow, Get Workflow Step, Update Delayed Routing, Update Scheduled Sending, Update Workflow, Update Workflow Step |
| Envelopes | Document Generation | Get Form Fields, Update Form Fields |
| Envelopes | Responsive HTML Preview | Create Envelope Preview, Create Document Preview |
| Envelopes | Tabs Blob | Get, Update |
| Templates | Template | Create, Delete Document Page, Delete Group Share, Get, Get Many, Get Notification Settings, Get Page Images, Rotate Document Page, Update, Update Group Share, Update Notification Settings |
| Templates | Template Custom Field | Create, Delete, Get Many, Update |
| Templates | Template Document | Delete, Download, Get Many, Update, Update All |
| Templates | Template Document Field | Create, Delete, Get Many, Update |
| Templates | Template Document Tab | Create, Delete, Get, Get by Page, Update |
| Templates | Template Document Visibility | Get, Update, Update List |
| Templates | Template HTML Definition | List, List Document, Create Responsive HTML, Create Document Responsive HTML |
| Templates | Template Lock | Create, Delete, Get, Update |
| Templates | Template Recipient | Create, Create Preview, Delete, Delete Many, Get Many, Update |
| Templates | Template Recipient Tab | Create, Delete, Get Many, Update |
| Templates | Template View | Create Edit View |
| Account | Account | Get, Get Billing Charges, Get Envelope Purge Configuration, Get Notification Defaults, List Recipient Names by Email, List Settings, List Shared Access, List Supported Languages, List Unsupported File Types, Update Envelope Purge Configuration, Update Notification Defaults, Update Settings, Update Shared Access |
| Account | Account Brand | Create, Delete, Delete List, Delete Logo, Get, Get Export File, Get Logo, Get Many, Get Resource, List Resources, Update, Update Logo, Update Resource |
| Account | Account Consumer Disclosure | Get, Get Default, Update |
| Account | Account Custom Field | Create, Delete, Get Many, Update |
| Account | Account Password Rule | Get, Get for User, Update |
| Account | Account Permission Profile | Create, Delete, Get, Get Many, Update |
| Account | Account Seal Provider | Get Many |
| Account | Account Signature | Create, Delete, Delete Image, Get, Get Image, Get Many, Update, Update By ID, Update Image |
| Account | Account Signature Provider | Get Many |
| Account | Account Tab Setting | Get, Update |
| Account | Account Watermark | Get, Preview, Update |
| Account | Authorization | Create User Authorization, Create User Authorizations, Delete User Authorization, Delete User Authorizations, Get Agent User Authorizations, Get Principal User Authorizations, Get User Authorization, Update User Authorization |
| Account | eNote Configuration | Delete, Get, Update |
| Account | Favorite Template | Get, Un-Favorite, Update |
| Account | Identity Verification | Get Many |
| Users & Groups | User | Create, Delete, Delete Profile Image, Get, Get Many, Get Profile Image, Get Settings, Update, Update List, Update Profile Image, Update Settings |
| Users & Groups | User Contact | Create, Delete, Delete List, Get, Update |
| Users & Groups | User Custom Setting | Delete, Get Many, Update |
| Users & Groups | User Profile | Get, Update |
| Users & Groups | User Signature | Create, Delete, Delete Image, Get, Get Image, Get Many, Update, Update Image, Update List |
| Users & Groups | Group | Create, Delete, Get Many, Update |
| Users & Groups | Group Brand | Delete, Get, Update |
| Users & Groups | Group User | Delete, Get Many, Update |
| Billing | Billing Plan | Get, Get Account Plan, Get Credit Card, Get Downgrade Request, Get Many, Purchase Envelopes, Update, Update Downgrade |
| Billing | Invoice | Get, Get Many |
| Billing | Payment | Get, Get Many |
| Billing | Payment Gateway | Get Many |
| Connect | Connect Configuration | Create, Delete, Delete Event Log, Get, Get Event Failures, Get Event Log, Get Many, Publish to Connect, Retry Event for Envelope, Update |
| Folders | Folder | Get Many, List Items, Move Envelopes, Search |
| Signing Groups | Signing Group | Create, Delete, Get, Get Many, Update, Update List |
| Signing Groups | Signing Group User | Delete, Get Many, Update |
| PowerForms | PowerForm | Create, Delete, Delete Many, Get, Get Many, List Senders, Update |
| PowerForms | PowerForm Data | Get Many |
| Bulk Operations | Bulk Envelope | Create Bulk Send List, Delete Bulk Send List, Get Bulk Send List, Get Many, Send Bulk, Update Bulk Send List |
| Bulk Operations | Chunked Upload | Commit, Create, Delete, Get, Update |
| Workspaces | Workspace | Create, Delete, Get, Get Many, Update |
| Workspaces | Workspace Item | Create File, Delete Folder Items, Get File, List File Pages, List Folder Items, Update File |
| Advanced | BCC Email Archive | Create, Delete, Get, List |
| Advanced | Cloud Storage | List Files, List Folders, List Providers |
| Advanced | Custom Tab | Create, Delete, Get, Get Many, Update |
| Advanced | Notary | Create, Get, Update |
| Advanced | Notary Journal | List |
| Advanced | Notary Jurisdiction | Create, Delete, Get, List, Update |
| Advanced | Request Log | Delete, Get, Get Settings, List, Update Settings |
| Advanced | Diagnostic Resource | Get |
| Advanced | Diagnostic Service | Get |

### Trigger events

The **DocuSign Trigger** registers a DocuSign Connect configuration for the workflow and removes it when the workflow is deactivated. Events available are listed below.

- Envelope Completed
- Envelope Created
- Envelope Declined
- Envelope Delivered
- Envelope Sent
- Envelope Voided
- Recipient Auth Failed
- Recipient Auto Responded
- Recipient Completed
- Recipient Declined
- Recipient Delivered
- Recipient Sent

Create a **DocuSign Connect HMAC API** credential with a key from DocuSign Admin, **Connect**, **Connect Keys**, and attach it to the trigger. The credential is encrypted and not included in workflow exports. The older Options > HMAC Secret field still works when no credential is attached, but it is stored in the workflow, so move the key to the credential. DocuSign signs every event with its active keys, and the trigger accepts a call only when one signature header matches one of your keys (constant time comparison). Separate two keys with a comma while you rotate. Calls without a valid signature get HTTP 401, and the trigger will not activate without a key.

## Upgrading to 3.4

| Change | What to do |
|---|---|
| The trigger runs only for a signed event that names a subscribed event and carries its own Connect configuration ID; payloads without them are ignored | Nothing for subscriptions the trigger created, which always send both |
| Version 3 nodes output no items for list responses whose result arrays are empty, such as `{ groups: [] }` | Nothing for saved nodes on versions 1 and 2 |
| Anchored tabs send the Anchor Match Whole Word, Case Sensitive and Ignore If Not Present values you choose | Nothing |
| Anchor Horizontal Alignment offers only Left and Right; Center is rejected with a message | Pick Left or Right. DocuSign never supported Center |

## Upgrading to 3.3

| Change | What to do |
|---|---|
| New DocuSign nodes use version 3: a list with no results outputs no items | Nothing for saved nodes, which stay on version 1 or 2 and keep the count item. In new nodes, turn on Always Output Data if a later step must run on an empty list |
| Envelope and template Create with only reminders also send the account-default expiration | Nothing. Before, such envelopes expired the next day |
| The trigger runs only for events it subscribed to and from its own Connect configuration (tightened in 3.4) | Nothing |
| A recipient's Email Language is sent without a custom subject or body | Nothing |

## Upgrading to 3.2

| Change | What to do |
|---|---|
| Envelope Attachment Get on node version 1 returns the binary of 2.1.0 plus the JSON fields of 3.0.0 | Nothing. Workflows built on either release keep working |
| Template page rotation sends DocuSign's left or right; 180 degrees is two turns | Nothing. Every rotation choice now works |
| Workspace folder list sends Include Files and Include Sub Folders; the Type filter turns the matching one on. Delete accepts DocuSign's id and type keys and converts itemId and itemType | Nothing |
| Chunked Upload Update defaults Chunk Index to 1, the first part after Create | Set it explicitly if you relied on 0, which DocuSign rejects after Create |
| Phone numbers like +14155550100 split the country code without a space; Retry-After on wrapped n8n errors is honoured | Nothing |

## Upgrading to 3.1

| Change | What to do |
|---|---|
| Envelope Attachment Get returns binary data on node version 1 again, the 2.1.0 output | If a node built on 3.0.0 read the JSON response, read the file from the binary output instead |
| Template Update Notification Settings sends exactly the fields you set, and 0 stays 0 | Nothing. Earlier versions dropped a lone Expire After and turned a 0 warning into 3 days |
| Template Create SMS signers send a Phone Number; list, radio group and formula tabs send their items, radios, group name and formula | Nothing. New fields, empty by default |
| Return All no longer stops at 50 pages; a changed webhook URL deletes the old Connect subscription | Nothing |

## Upgrading to 3.0

| Change | What to do |
|---|---|
| The DocuSign node has a version 2. New nodes use it; saved nodes stay on version 1. Both behave the same | Nothing |
| 3.0.0 only: Envelope Attachment Get returned JSON on version 1 | Fixed in 3.1.0. Both versions return the file as binary data in `data`, as 2.1.0 did. Upgrade from 3.0.0 to 3.1.0 |
| Cloud Storage Get File is gone from the picker | DocuSign has no endpoint for it. Use List Files. Saved workflows that use it stop with a clear message |
| New, off by default: Group Get Many paging, Send Empty and No Values on tab updates, phone numbers on recipient updates, four more envelope operations | Nothing. Turn them on where you need them |

Choices made where DocuSign's API differs from an operation's name are listed in [docs/DESIGN-DECISIONS.md](https://github.com/mjmirza/n8n-docusign/blob/master/docs/DESIGN-DECISIONS.md).

## Upgrading to 2.0

| Change | What to do |
|---|---|
| DocuSign Trigger requires the Connect HMAC key | Create a key in DocuSign Admin, Connect, Connect Keys, paste it into Options, HMAC Secret, then reactivate the workflow |
| Envelope Delete moves the envelope to the recycle bin and returns `{ envelopeId, deleted: true }` | Update any step that read the old void response |
| POST and PATCH are no longer retried after 502, 503 or 504 | Check the envelope list before retrying a failed create by hand, the first attempt may have succeeded |

Saved workflows keep their parameters, no field was renamed or removed.

### 2.1

| Change | What to do |
|---|---|
| The HMAC key moves to the **DocuSign Connect HMAC API** credential | Create the credential, attach it to the trigger and clear Options > HMAC Secret. The old field keeps working until you do |
| Envelope Template Delete needs a Document ID | Set the document the template was applied to |
| Envelope Attachment Get and Envelope Comment Get return binary data in `data` | Read the file from the binary output instead of the JSON |
| Password Rules Get For User returns the signed-in user's rules | DocuSign has no endpoint for another user's rules |

## Compatibility

- n8n 1.x and 2.x, self-hosted. Tested against `n8n-workflow` 2.45.
- n8n Cloud once the package passes n8n verification. It ships with no runtime dependencies and passes the `@n8n/scan-community-package` checks.
- DocuSign eSignature REST API v2.1, demo and production environments.

## For developers

### Structure

```
credentials/                 OAuth2, JWT and Connect HMAC credential types
nodes/DocuSign/
  DocuSign.node.ts           action node, routes resources to handlers
  DocuSignTrigger.node.ts    Connect webhook trigger
  transport.ts               HTTP client, retry with backoff, error mapping
  utils/                     shared fields, validators, binary helpers
  resources/<resource>/      operations.ts, fields.ts, handler.ts per resource
tests/                       Jest suites with a mocked n8n context
```

### Build, test, lint

Use Node 22 or 24.

```bash
npm ci
npm run build          # tsc plus icon copy into dist
npx tsc --noEmit       # type check
npm test               # Jest
npx @n8n/scan-community-package n8n-nodes-docusigns   # n8n verification scan of the published version
```

### Release flow

1. Bump `version` in package.json and add a CHANGELOG entry on a branch.
2. Open a pull request, wait for CI, squash merge.
3. Tag the merge commit `vX.Y.Z` and push the tag.
4. The Publish workflow builds, tests and runs `npm publish --provenance`, so every version on npm links back to the exact commit that produced it.

## Support

- Email support@next8n.com
- Bugs and feature requests on [GitHub issues](https://github.com/mjmirza/n8n-docusign/issues)

## License

[MIT](LICENSE). DocuSign is a trademark of DocuSign, Inc. This is an independent integration, see [docs/TRADEMARKS.md](https://github.com/mjmirza/n8n-docusign/blob/master/docs/TRADEMARKS.md).
