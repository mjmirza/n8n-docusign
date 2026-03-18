# DocuSign Sandbox Configuration

## Credentials

| Field | Value |
|-------|-------|
| Environment | Demo / Sandbox |
| User ID | `15e62979-ef06-451c-9216-f50622f70416` |
| API Account ID | `0f0f0165-d266-4f04-af45-69fd6363461c` |
| Account Base URI | `https://demo.docusign.net` |
| REST API Base | `https://demo.docusign.net/restapi/v2.1` |
| OAuth Base | `https://account-d.docusign.com` |

## Authentication Endpoints

| Endpoint | URL |
|----------|-----|
| Authorization URL | `https://account-d.docusign.com/oauth/auth` |
| Token URL | `https://account-d.docusign.com/oauth/token` |
| User Info | `https://account-d.docusign.com/oauth/userinfo` |

## Required Scopes

```
signature extended
```

For JWT with impersonation:
```
signature extended impersonation
```

## Rate Limits (Demo)

| Limit | Value |
|-------|-------|
| Hourly | 3,000 requests |
| Burst (30s) | 500 requests |
| Polling | Max 1 request per 15 minutes |

## Testing Notes

- Demo accounts have full API access but limited quotas
- Envelopes in demo expire after 30 days
- PowerForms require activation in account settings
- Notary features require Notary-enabled account
- Billing endpoints return limited data in demo
- Bulk send limited to 1,000 copies per batch
