# Architecture: Payment invoice HTML (v1)

## Module

**Payment**-owned printable artifact. **Deal** data is read as parent context. The invoice route **writes only** lazy **`invoice_number`** (+ counter) on first successful GET; it does not change payment amounts, status, or deal fields.

## Data flow

Input: HTTP GET `dealId`, `paymentId`  
→ Validate: payment exists and `payment.dealId === dealId`  
→ **Assign number (first open):** In one transaction: `SELECT … FOR UPDATE` on the payment row; if `invoice_number` is null, upsert global `invoice_counters` (`id = 'singleton'`), increment `last_seq`, format `INV-########`, persist on `payments.invoice_number` (unique).  
→ Normalize: map Prisma rows to plain fields + `generatedAtIso` (server UTC) + optional `INVOICE_*` env (document label, issuer, place of supply) via `apps/api/src/lib/payment-invoice-env.ts`  
→ Process: `buildPaymentInvoiceHtml` in `@oompa/utils` (escape + format + print toolbar script)  
→ Output: `200` + `text/html; charset=utf-8`, `Cache-Control: no-store`

## Data model changes

- Table **`invoice_counters`**: singleton row holds monotonic **`last_seq`** for `INV-*` assignment.  
- Column **`payments.invoice_number`**: optional until first successful GET; then **immutable** for that row (re-opens reuse the same number).  
- Migration: `packages/db/prisma/migrations/20260406120000_invoice_counter_and_number/`.

## API contract

| Method | Path | Success | Errors |
|--------|------|---------|--------|
| GET | `/api/v1/deals/:dealId/payments/:paymentId/invoice` | `200` HTML | `404` if payment missing or wrong deal |

**Versioning:** New path under existing `/api/v1` prefix; additive only.

## Events

Emits: none.  
Consumes: none.

## Scale analysis

One transactional round-trip: row lock on payment, possible counter upsert + payment update on **first** open; subsequent opens are a single read by id. Suitable for on-demand use; **no HTTP cache** (`no-store`) so HTML always matches current row snapshot.

## Tech choices

| Choice | Alternatives | Why this |
|--------|----------------|----------|
| HTML in `@oompa/utils` | Template in API only | Unit-testable, reusable if another surface needs the same document |
| `escapeHtml` + `formatCurrency` | Raw interpolation | Prevents XSS; matches app money display |
| `no-store` | `public` cache | Avoids stale invoices after edits |
| DB counter + `FOR UPDATE` | UUID per invoice row | Deterministic global sequence without cross-deal leakage; avoids double assignment under concurrency |

## Operational design

- **Deploy:** run **`prisma migrate deploy`** before or with API rollout (new columns/table).  
- **Rollback:** revert API; DB columns can remain nullable/empty in emergency; do not drop counter table mid-flight without a plan (numbers already issued).  
- **Monitoring:** `5xx` rate and latency on `GET …/invoice` vs `listPayments`; watch migration errors (**`P2022`**) if deploy ordering wrong.
