# DocuSign eSign REST API v2.1 — Complete Coverage Matrix

## Legend
- ✅ Implemented & tested
- 🔧 Planned (next phase)
- ⬚ Planned (future phase)

---

## Envelopes Category

### Envelopes (Core)
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| create | POST | `/envelopes` | ✅ |
| createFromTemplate | POST | `/envelopes` (with templateId) | ✅ |
| get | GET | `/envelopes/{envelopeId}` | ✅ |
| getAll (listStatusChanges) | GET | `/envelopes` | ✅ |
| update | PUT | `/envelopes/{envelopeId}` | ✅ |
| send | PUT | `/envelopes/{envelopeId}` (status=sent) | ✅ |
| void | PUT | `/envelopes/{envelopeId}` (status=voided) | ✅ |
| delete | PUT | `/envelopes/{envelopeId}` (purge) | ✅ |
| downloadDocuments | GET | `/envelopes/{envelopeId}/documents/{docId}` | ✅ |
| getSigningUrl | POST | `/envelopes/{envelopeId}/views/recipient` | ✅ |
| listAuditEvents | GET | `/envelopes/{envelopeId}/audit_events` | ✅ |
| listStatusChanges | GET | `/envelopes` (with filters) | ✅ |
| getNotificationSettings | GET | `/envelopes/{envelopeId}/notification` | ✅ |
| updateNotificationSettings | PUT | `/envelopes/{envelopeId}/notification` | ✅ |
| deleteDocumentPage | DELETE | `/envelopes/{envelopeId}/documents/{docId}/pages/{pageId}` | 🔧 |
| getPageImage | GET | `/envelopes/{envelopeId}/documents/{docId}/pages/{pageId}/page_image` | 🔧 |
| getPageImages | GET | `/envelopes/{envelopeId}/documents/{docId}/pages` | 🔧 |
| getRecipientInitialsImage | GET | `/envelopes/{envelopeId}/recipients/{recipientId}/initials_image` | 🔧 |
| getRecipientSignature | GET | `/envelopes/{envelopeId}/recipients/{recipientId}/signature` | 🔧 |
| getRecipientSignatureImage | GET | `/envelopes/{envelopeId}/recipients/{recipientId}/signature_image` | 🔧 |
| rotateDocumentPage | PUT | `/envelopes/{envelopeId}/documents/{docId}/pages/{pageId}/page_image` | 🔧 |
| updateRecipientInitialsImage | PUT | `.../recipients/{recipientId}/initials_image` | 🔧 |
| updateRecipientSignatureImage | PUT | `.../recipients/{recipientId}/signature_image` | 🔧 |

### Envelope Recipients
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| list | GET | `/envelopes/{id}/recipients` | ✅ |
| create (add) | POST | `/envelopes/{id}/recipients` | ✅ |
| update | PUT | `/envelopes/{id}/recipients` | ✅ |
| delete | DELETE | `/envelopes/{id}/recipients` | ✅ |
| createPreview | POST | `/envelopes/{id}/recipients/recipient_preview` | 🔧 |
| createManualReviewView | POST | `/envelopes/{id}/recipients/{rid}/manual_review_view` | 🔧 |
| createProofFileResourceToken | POST | `/envelopes/{id}/recipients/{rid}/proof_file_resource_token` | 🔧 |
| deleteList | DELETE | `/envelopes/{id}/recipients` (bulk) | 🔧 |

### Envelope Documents
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| list | GET | `/envelopes/{id}/documents` | ✅ |
| download | GET | `/envelopes/{id}/documents/{docId}` | ✅ |
| delete | DELETE | `/envelopes/{id}/documents/{docId}` | 🔧 |
| update | PUT | `/envelopes/{id}/documents/{docId}` | 🔧 |
| updateList | PUT | `/envelopes/{id}/documents` | 🔧 |

### Envelope Recipient Tabs
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| list | GET | `/envelopes/{id}/recipients/{rid}/tabs` | 🔧 |
| create | POST | `/envelopes/{id}/recipients/{rid}/tabs` | 🔧 |
| update | PUT | `/envelopes/{id}/recipients/{rid}/tabs` | 🔧 |
| delete | DELETE | `/envelopes/{id}/recipients/{rid}/tabs` | 🔧 |

### Envelope Custom Fields
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| list | GET | `/envelopes/{id}/custom_fields` | 🔧 |
| create | POST | `/envelopes/{id}/custom_fields` | 🔧 |
| update | PUT | `/envelopes/{id}/custom_fields` | 🔧 |
| delete | DELETE | `/envelopes/{id}/custom_fields` | 🔧 |

### Envelope Views
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| createRecipient | POST | `/envelopes/{id}/views/recipient` | ✅ |
| createSender | POST | `/envelopes/{id}/views/sender` | 🔧 |
| createEdit | POST | `/envelopes/{id}/views/edit` | 🔧 |
| createCorrect | POST | `/envelopes/{id}/views/correct` | 🔧 |
| createConsole | POST | `/envelopes/{id}/views/console` | 🔧 |
| createSharedRecipient | POST | `/envelopes/{id}/views/shared` | 🔧 |
| deleteCorrectView | DELETE | `/envelopes/{id}/views/correct` | 🔧 |

### Envelope Attachments
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| list | GET | `/envelopes/{id}/attachments` | 🔧 |
| get | GET | `/envelopes/{id}/attachments/{attachmentId}` | 🔧 |
| create/update | PUT | `/envelopes/{id}/attachments` | 🔧 |
| delete | DELETE | `/envelopes/{id}/attachments/{attachmentId}` | 🔧 |

### Envelope Locks
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| get | GET | `/envelopes/{id}/lock` | 🔧 |
| create | POST | `/envelopes/{id}/lock` | 🔧 |
| update | PUT | `/envelopes/{id}/lock` | 🔧 |
| delete | DELETE | `/envelopes/{id}/lock` | 🔧 |

### Envelope Templates
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| list | GET | `/envelopes/{id}/templates` | 🔧 |
| apply | POST | `/envelopes/{id}/templates` | 🔧 |
| applyToDocument | POST | `/envelopes/{id}/documents/{docId}/templates` | 🔧 |
| delete | DELETE | `/envelopes/{id}/templates/{templateId}` | 🔧 |
| listByDocument | GET | `/envelopes/{id}/documents/{docId}/templates` | 🔧 |

### Envelope Document Tabs
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| get | GET | `/envelopes/{id}/documents/{docId}/tabs` | 🔧 |
| create | POST | `/envelopes/{id}/documents/{docId}/tabs` | 🔧 |
| update | PUT | `/envelopes/{id}/documents/{docId}/tabs` | 🔧 |
| delete | DELETE | `/envelopes/{id}/documents/{docId}/tabs` | 🔧 |
| getByPage | GET | `/envelopes/{id}/documents/{docId}/pages/{page}/tabs` | 🔧 |

### Envelope Document Fields
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| list | GET | `/envelopes/{id}/documents/{docId}/fields` | 🔧 |
| create | POST | `/envelopes/{id}/documents/{docId}/fields` | 🔧 |
| update | PUT | `/envelopes/{id}/documents/{docId}/fields` | 🔧 |
| delete | DELETE | `/envelopes/{id}/documents/{docId}/fields` | 🔧 |

### Envelope Email Settings
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| get | GET | `/envelopes/{id}/email_settings` | 🔧 |
| create | POST | `/envelopes/{id}/email_settings` | 🔧 |
| update | PUT | `/envelopes/{id}/email_settings` | 🔧 |
| delete | DELETE | `/envelopes/{id}/email_settings` | 🔧 |

### Envelope Form Data
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| get | GET | `/envelopes/{id}/form_data` | 🔧 |

### Envelope Document Visibility
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| get | GET | `/envelopes/{id}/recipients/{rid}/document_visibility` | 🔧 |
| update | PUT | `/envelopes/{id}/recipients/{rid}/document_visibility` | 🔧 |
| updateAll | PUT | `/envelopes/{id}/recipients/document_visibility` | 🔧 |

### Envelope Locks
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| get/create/update/delete | * | `/envelopes/{id}/lock` | 🔧 |

### Envelope Transfer Rules
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| CRUD + updateRule | * | `/accounts/{id}/envelopes/transfer_rules` | ⬚ |

### Envelope Workflow Definition
| Operation | Method | Endpoint | Status |
|-----------|--------|----------|--------|
| 26 operations | * | `/envelopes/{id}/workflow` + steps, routing, scheduling | ⬚ |

### Additional Envelope Sub-Resources
| Resource | Operations | Status |
|----------|-----------|--------|
| Comments | get | ⬚ |
| Consumer Disclosures | get, getDefault | ⬚ |
| Document Generation | get/update form fields | ⬚ |
| HTML Definitions | list | ⬚ |
| Publish | createHistorical | ⬚ |
| Responsive HTML Preview | create | ⬚ |
| Tabs Blob | get, put | ⬚ |
| Chunked Uploads | commit, create, delete, get, update | ⬚ |
| Notary Journals | list | ⬚ |

---

## Templates Category

### Templates (Core)
| Operation | Method | Status |
|-----------|--------|--------|
| get | GET | ✅ |
| getAll | GET (list) | ✅ |
| create | POST | ⬚ |
| update | PUT | ⬚ |
| delete (page) | DELETE | ⬚ |
| 10+ more | * | ⬚ |

### Template Sub-Resources (14 total)
All ⬚ — planned for Phase 2.

---

## Account Category (15 sub-resources)
All ⬚ — planned for Phase 3.

## Users & Groups Category (9 sub-resources)
All ⬚ — planned for Phase 4.

## Remaining Categories
| Category | Sub-Resources | Phase |
|----------|--------------|-------|
| Envelope Advanced | 12 | Phase 5 |
| Account Advanced | 9 | Phase 6 |
| Connect, PowerForms, Folders, Workspaces | 6 | Phase 7 |
| Billing, Bulk, Cloud Storage | 7 | Phase 8 |
| Diagnostics, Email Archive, Notary | 7 | Phase 9 |

---

## Current Implementation Stats

| Metric | Count |
|--------|-------|
| Implemented operations | ~18 |
| Total planned operations | ~390 |
| Coverage | ~4.6% |
| Resources implemented | 4 |
| Total resources planned | 85+ |
| Tests passing | 37 |
| Phase | 0 (Infrastructure complete) |
