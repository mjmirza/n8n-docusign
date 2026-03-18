<p align="center">
  <img src="https://unpkg.com/n8n-nodes-docusign@latest/dist/nodes/DocuSign/docusign.svg" alt="DocuSign" width="80" />
</p>

<h1 align="center">n8n-nodes-docusign</h1>

<p align="center">
  <strong>The most complete DocuSign eSignature integration for n8n. Period.</strong><br/>
  Built, maintained, and owned by <a href="https://next8n.com">next8n</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/n8n-nodes-docusign"><img src="https://img.shields.io/npm/v/n8n-nodes-docusign?style=for-the-badge&color=CB3837&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/n8n-nodes-docusign"><img src="https://img.shields.io/npm/dt/n8n-nodes-docusign?style=for-the-badge&color=blue&label=downloads" alt="npm downloads" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Resources-80-4C2882?style=for-the-badge" alt="80 Resources" />
  <img src="https://img.shields.io/badge/Operations-330+-4C2882?style=for-the-badge" alt="330+ Operations" />
  <img src="https://img.shields.io/badge/Tests-884_Passed-brightgreen?style=for-the-badge" alt="884 Tests Passed" />
  <img src="https://img.shields.io/badge/API-Full_Coverage-4C2882?style=for-the-badge" alt="Full API Coverage" />
  <img src="https://img.shields.io/badge/Webhooks-DocuSign_Connect-080436?style=for-the-badge" alt="DocuSign Connect" />
  <img src="https://img.shields.io/badge/Security-Enterprise_Hardened-080436?style=for-the-badge" alt="Enterprise Hardened" />
  <img src="https://img.shields.io/badge/SSRF-Protected-080436?style=for-the-badge" alt="SSRF Protected" />
  <img src="https://img.shields.io/badge/HMAC-Webhook_Verified-080436?style=for-the-badge" alt="HMAC Verified" />
  <img src="https://img.shields.io/badge/n8n-Community_Node-FF6D5A?style=for-the-badge" alt="n8n Community Node" />
  <img src="https://img.shields.io/badge/AI_Agent-Compatible-98C1D9?style=for-the-badge" alt="AI Agent Compatible" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Maintained-Active-brightgreen?style=for-the-badge" alt="Actively Maintained" />
</p>

---

## You're duct-taping DocuSign into your workflows. And it's breaking.

Every time someone needs to send an envelope, check a signing status, download completed documents, or trigger a workflow when a contract is signed — you're either building custom scripts, paying for middleware, or manually downloading PDFs and uploading them somewhere else.

Your legal team wants contracts auto-sent from the CRM. Your ops team wants signed documents in SharePoint. Your sales team wants Slack notifications when deals close. They want it **now**.

**This node connects everything in 2 minutes.**

Drop it into any n8n workflow. 80 resources. 330+ operations. The **entire** DocuSign eSignature REST API v2.1 — envelopes, templates, recipients, tabs, documents, views, workflows, brands, users, groups, billing, bulk send, PowerForms, folders, workspaces, notary. All of it.

No other DocuSign node comes close.

<p align="center">
  <a href="https://next8n.com"><img src="https://img.shields.io/badge/Need_Help_Setting_Up%3F-Book_a_Free_Call-4C2882?style=for-the-badge&logoColor=white" alt="Book a consultation" /></a>
</p>

---

## How it works

```
[DocuSign] <--> [n8n-nodes-docusign] <--> [Your CRM / Email / Sheets / Slack / Anything]
```

**Trigger: Contract signed**
```json
{
  "event": "envelope-completed",
  "data": {
    "envelopeId": "abc-123-def",
    "status": "completed",
    "emailSubject": "NDA for Project Alpha",
    "completedDateTime": "2024-12-15T14:30:00Z"
  }
}
```

**Action: Automatically process everywhere**
```
DocuSign Trigger → Download PDF → Google Drive (archive) → HubSpot (update deal) → Slack (notify legal)
```

No code. No Zapier. No monthly per-zap pricing. Just n8n + this node.

---

## What you get — the full DocuSign eSign API v2.1

Other nodes cover 5–10 endpoints. We cover **all 80 resources with 330+ operations**.

### Envelopes & Signing
| Resource | What you can do |
|----------|----------------|
| Envelope | Create, send, void, update, download documents, get embedded signing URLs |
| Envelope Recipient | Add, update, remove signers, CC, agents, editors, witnesses, in-person signers |
| Envelope Recipient Tab | Create/update/delete 20+ tab types (sign here, text, checkbox, date, dropdown, radio, formula, etc.) |
| Envelope Document | List, download, update, delete documents within envelopes |
| Envelope View | Generate embedded signing, sender, edit, correct, console, shared recipient URLs |
| Envelope Custom Field | Add metadata to envelopes for tracking and integration |
| Envelope Form Data | Extract completed form field data from signed envelopes |
| Envelope Lock | Lock/unlock envelopes for exclusive editing |
| Envelope Attachment | Attach supporting documents to envelopes |
| Envelope Email Setting | Override reply-to, BCC addresses per envelope |
| Envelope Document Tab | Manage tabs at the document level |
| Envelope Document Field | Custom document metadata |
| Envelope Document Visibility | Control which recipients see which documents |
| Envelope Template | Apply/remove templates to existing envelopes |
| Envelope Workflow | Workflow steps, delayed routing, scheduled sending |
| Envelope Transfer Rule | Automate envelope ownership transfers |

### Templates
| Resource | What you can do |
|----------|----------------|
| Template | Full CRUD, group sharing, notification settings, page rotation |
| Template Recipient | Add/update/delete recipient roles with all properties |
| Template Recipient Tab | Full tab management per recipient role |
| Template Document | Add, update, delete, download template documents |
| Template Custom Field | Template-level metadata fields |
| Template Document Tab | Document-level tabs |
| Template Document Field | Document metadata |
| Template Document Visibility | Per-recipient document visibility |
| Template Lock | Lock/unlock templates |
| Template View | Generate template edit URLs |
| Template HTML Definition | Responsive HTML settings |

### Account Administration
| Resource | What you can do |
|----------|----------------|
| Account | Settings, billing charges, purge config, notification defaults, shared access |
| Account Brand | White-label branding with logo upload/download — primary, secondary, email logos |
| Account Permission Profile | Create and manage user permission profiles |
| Account Custom Field | Account-level custom metadata fields |
| Account Tab Setting | Tab type configuration |
| Account Consumer Disclosure | E-sign disclosure management |
| Account Password Rule | Password policy management |
| Account Watermark | Document watermark settings |
| Account Signature | Account-level signature management with image upload |
| eNote Configuration | Electronic notarization settings |
| Custom Tab | Reusable tab type definitions |

### Users & Groups
| Resource | What you can do |
|----------|----------------|
| User | Full CRUD, profile images, settings, bulk update |
| User Profile | Address, company, title management |
| User Signature | Signature and initials image management |
| User Custom Setting | Per-user custom settings |
| User Contact | Contact book management |
| Group | Create and manage user groups |
| Group User | Group membership management |
| Group Brand | Group branding |
| Authorization | Delegation management (agent/principal authorizations) |

### Signing Groups, PowerForms, Folders
| Resource | What you can do |
|----------|----------------|
| Signing Group | Group signing with member management |
| PowerForm | Self-service signing forms — create, manage, track data |
| Folder | Organize envelopes, move between folders, search |
| Connect Configuration | Webhook management, event logs, retry failed events |
| Identity Verification | List identity verification providers |
| Favorite Template | Manage favorite templates |

### Billing, Bulk Operations, Cloud Storage
| Resource | What you can do |
|----------|----------------|
| Billing Plan | View plans, purchase envelopes, manage downgrades |
| Invoice | List and retrieve billing invoices |
| Payment | List and retrieve payment records |
| Bulk Envelope | Create bulk send lists, send to 1,000+ recipients at once |
| Chunked Upload | Upload documents larger than 25MB |
| Cloud Storage | Browse Box, Dropbox, Google Drive, OneDrive files |
| Workspace | Collaborative document workspaces with file management |

### Diagnostics, Compliance, Notary
| Resource | What you can do |
|----------|----------------|
| Request Log | API request logging for debugging |
| BCC Email Archive | Email archiving for compliance |
| Notary | Remote online notarization management |
| Notary Jurisdiction | Notary jurisdiction CRUD |
| Notary Journal | Notary journal entries |

---

## Real-time triggers — DocuSign Connect webhooks

The **DocuSign Trigger** node fires instantly when things happen:

| Category | Events |
|----------|--------|
| **Envelope** | Completed, Created, Declined, Delivered, Sent, Voided |
| **Recipient** | Auth Failed, Auto Responded, Completed, Declined, Delivered, Sent |

HMAC-SHA256 signature verification included — every webhook is cryptographically verified.

---

## Enterprise-grade security. Not an afterthought.

| Feature | Implementation |
|---------|---------------|
| **SSRF Protection** | Fixed base URLs — requests can only reach `demo.docusign.net` or `www.docusign.net` |
| **Input Sanitization** | Every ID validated against path traversal, injection, null bytes |
| **Prototype Pollution** | Dynamic keys (recipient types, tab types) validated against strict allowlists |
| **Endpoint Sanitization** | URL-encoded traversal patterns decoded and blocked |
| **Webhook HMAC** | SHA-256 signature verification with timing-safe comparison |
| **Retry Logic** | Exponential backoff with jitter on 429/502/503/504 |
| **Error Handling** | Truncated error messages (no PII leakage), per-item continue-on-fail |
| **NodeApiError** | Proper n8n error display with status codes and descriptions |
| **884 Tests** | 72 security, 106 error handling, 47 compliance tests — all passing |

---

## Installation

### From n8n (Recommended)

1. Go to **Settings → Community Nodes**
2. Enter `n8n-nodes-docusign`
3. Click **Install**
4. Done. The **DocuSign** node appears in your node palette.

### Manual

```bash
cd ~/.n8n
npm install n8n-nodes-docusign
```

---

## Quick Start (2 minutes)

1. **Install** the node (see above)
2. **Create credentials:** DocuSign OAuth2 → authorize with your DocuSign account
3. **Drag "DocuSign"** into any workflow
4. **Pick a category** (Envelopes, Templates, Account, etc.)
5. **Pick a resource** (Envelope, Recipient, Document, etc.) and operation
6. **Run it.** That's it.

For real-time triggers, use the **DocuSign Trigger** node — select your events, activate the workflow, and incoming webhook data flows automatically.

---

## Authentication

| Method | Best For |
|--------|----------|
| **OAuth2** | Interactive apps where a user authorizes access |
| **JWT** | Server-to-server automation (no user interaction needed) |

Both methods support **Demo (Sandbox)** and **Production** environments.

---

## Who this is for

- **n8n consultants** building contract automation for clients who use DocuSign
- **Legal teams** automating NDA, employment agreement, and vendor contract workflows
- **HR departments** streamlining offer letters, onboarding documents, and policy acknowledgments
- **Real estate** automating purchase agreements, disclosures, and closing documents
- **Sales teams** connecting DocuSign to their CRM for automatic contract-to-close workflows
- **Anyone** tired of manually downloading signed PDFs and filing them somewhere

---

## We build DocuSign automation. For a living.

We've delivered n8n automation for clients across **legal**, **HR**, **real estate**, **finance**, and **enterprise ops** — all using DocuSign as their signing platform.

The question always comes up: "Can you connect DocuSign to [X]?" The existing nodes covered 10 endpoints. Our clients needed 330+.

**This node exists because we solve this problem every day.**

<p align="center">
  <a href="https://next8n.com"><img src="https://img.shields.io/badge/Need_a_Custom_Integration%3F-Let's_Talk-4C2882?style=for-the-badge&logoColor=white" alt="Custom integration" /></a>
</p>

---

## Other nodes by next8n

| Node | What it does |
|------|-------------|
| [n8n-nodes-clickfunnel](https://www.npmjs.com/package/n8n-nodes-clickfunnel) | Full ClickFunnels 2.0 integration — 52 resources, 200+ operations |
| [n8n-nodes-xentral](https://www.npmjs.com/package/n8n-nodes-xentral) | Full Xentral ERP integration — 30 resources, 196 operations |
| [n8n-nodes-redactor](https://www.npmjs.com/package/n8n-nodes-redactor) | Redact PII before sending to LLMs — GDPR/HIPAA compliant |

---

## Legal Notice

This is an independent, community-built integration that uses the publicly available [DocuSign eSignature REST API](https://developers.docusign.com/docs/esign-rest-api/).

"DocuSign" and the DocuSign logo are trademarks of DocuSign, Inc. This project is **not** affiliated with, endorsed by, or sponsored by DocuSign, Inc. in any way. All product names, logos, and brands are property of their respective owners.

The DocuSign name and logo are used solely for the purpose of describing this integration's functionality and compatibility with the DocuSign platform. This constitutes nominative fair use.

## License

[MIT](LICENSE)

<p align="center">
  <a href="https://next8n.com"><img src="https://img.shields.io/badge/next8n.com-FF6D5A?style=for-the-badge&logoColor=white" alt="next8n" /></a>
</p>
