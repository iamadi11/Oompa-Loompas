# Architecture: Payment invoice HTML (v1)

## Module

**Payment** (read-only artifact). **Deal** data is read as parent context; no cross-module write paths.

## Data flow

Input: HTTP GET `dealId`, `paymentId`  
→ Validate: payment exists and `payment.dealId === dealId`  
→ Normalize: map Prisma rows to plain fields + `generatedAtIso` (server UTC)  
→ Process: `buildPaymentInvoiceHtml` in `@oompa/utils` (escape + format)  
→ Output: `200` + `text/html; charset=utf-8`, `Cache-Control: no-store`

## Data model changes

None. Invoice is **derived** from `deals` and `payments`.

## API contract

| Method | Path | Success | Errors |
|--------|------|---------|--------|
| GET | `/api/v1/deals/:dealId/payments/:paymentId/invoice` | `200` HTML | `404` if payment missing or wrong deal |

**Versioning:** New path under existing `/api/v1` prefix; additive only.

## Events

Emits: none.  
Consumes: none.

## Scale analysis

One DB read (`payment` + `deal` select). Suitable for on-demand use; no caching (financial clarity: always current row snapshot).

## Tech choices

| Choice | Alternatives | Why this |
|--------|----------------|----------|
| HTML in `@oompa/utils` | Template in API only | Unit-testable, reusable if another surface needs the same document |
| `escapeHtml` + `formatCurrency` | Raw interpolation | Prevents XSS; matches app money display |
| `no-store` | `public` cache | Avoids stale invoices after edits |

## Operational design

- **Deploy:** standard API deploy; no migration.
- **Rollback:** remove route + web link; no data impact.
- **Monitoring:** optional `5xx` rate on the new path; alert if spike after deploy.
