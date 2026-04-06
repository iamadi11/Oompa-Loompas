# Retro: Payment invoice — sequential numbering and issuer env

Shipped: 2026-04-06

## What was built

- **Lazy `INV-########`** assignment on first invoice GET, stored on **`payments.invoice_number`**, backed by **`invoice_counters`**, inside a **Prisma transaction** with **`FOR UPDATE`** on the payment row.  
- **Optional `INVOICE_*` env** for document title, supplier block, and place-of-supply line.  
- **Richer HTML** from **`@oompa/utils`** (line items, totals, compliance copy, embedded toolbar for print / copy / share / download).

## Decisions (and why)

- **Global singleton counter** — simplest deterministic sequence for a single-tenant v1 API; per-creator or per-org counters can replace later without breaking already-issued numbers.  
- **Assign on first open** — avoids coupling invoice creation to payment CRUD and matches “creator opens when the brand asks” behavior.  
- **Env-only issuer** — keeps PII and legal copy out of the database and under deploy-time control.

## Critic user (pre-ship)

Misconfigured **`NEXT_PUBLIC_API_URL`** still produces a broken tab; numbering does not fix that. First-open assignment means the **first viewer** “claims” the number — acceptable for solo creators, less so for shared accounts (out of scope for v1).

## Post-deploy baseline

See [docs/instrumentation/payment-invoice-html-v1.md](../instrumentation/payment-invoice-html-v1.md). Watch **`GET …/invoice`** `5xx` and **`P2022`** after deploy if migration lags the binary.

## What to watch

- Counter **hotspot** if invoice GET volume spikes (single row update).  
- Support: “wrong issuer on PDF” → **env** fix, not app bug.

## What we would do differently

- **Per-workspace counter** once multi-tenant identity exists.  
- **Explicit “Issue invoice”** action if brands require immutability before any URL is shared.
