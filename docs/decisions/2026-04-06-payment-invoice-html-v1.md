# Decision: Payment invoice HTML (v1)

Date: 2026-04-06  
Phase: 1 — Deal + Payment Intelligence  
Status: APPROVED

## What

Ship a **deterministic, printable HTML invoice** for a single **payment milestone**, scoped under its deal. Exposed as `GET /api/v1/deals/:dealId/payments/:paymentId/invoice` and linked from the deal detail **Payments** list as **View invoice** (opens in a new tab).

## Why Now

- [docs/product/feature-candidates-2026-04.md](../product/feature-candidates-2026-04.md) ranks **invoice from deal / payment** as the top “Get paid” epic item.
- Creators currently copy deal/payment fields manually into email or docs; this removes a high-friction step and shortens the “send me an invoice” loop.
- The codebase already has deal + payment CRUD, currency formatting, and tests; v1 adds **no new tables** and minimal API surface.

## Why Not PDF first

PDF generation adds dependencies, layout edge cases, and heavier operational risk. HTML prints cleanly from the browser, is easy to test as a string, and matches the “simplest viable system” rule.

## Why Not a generic “documents” module

A shared document service is premature. This slice is **Payment-owned**, read-only, and derived entirely from existing rows.

## User Without This Feature

1. Open deal in the app.  
2. Note brand, amount, due date, status.  
3. Switch to email/Docs/Canva.  
4. Re-type fields and send.  
5. Risk typos, wrong amounts, and inconsistent references.

## Success Criteria

- Invoice opens in one click from a payment row when API and web share the same configured API origin.
- HTML is **escaped** for user-provided strings; amounts use the same **Intl** rules as the app.
- **404** if the payment is missing or does not belong to the deal (no cross-deal leakage).
- Automated tests cover HTML builder, API route, and public API base URL consistency.

## Assumptions (to be validated)

- Creators accept **browser print-to-PDF** until a native PDF export is justified by volume or compliance feedback.
- A single **payment id** is an acceptable document reference until sequential invoice numbering and audit tables are specified.
