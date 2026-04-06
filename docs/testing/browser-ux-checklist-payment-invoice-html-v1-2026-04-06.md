# Browser MCP UX checklist — payment invoice HTML (v1)

**Date:** 2026-04-06  
**Environment:** Next.js dev `http://127.0.0.1:3005`, API `http://127.0.0.1:3001` (`API_URL` / `NEXT_PUBLIC_API_URL` aligned).  
**Source:** [docs/ux/payment-invoice-html-v1.md](../ux/payment-invoice-html-v1.md)

## Results

| Item | Result | Notes |
|------|--------|--------|
| Deal with payments → **View invoice** opens document in **new tab** | **Pass** | Second tab: `.../payments/{id}/invoice` on API origin |
| **Payments** region present (`aria-labelledby` pattern via heading) | **Pass** | Snapshot: `region` name **Payments**, heading level 2 |
| **Zero payments:** no **View invoice** links | **Pass** | Deal `bf97c9f5-...`: empty list + “No payment milestones…” only |
| **View invoice** exposes **`aria-label`** with formatted amount | **Pass** | e.g. link name **View printable invoice for ₹4,00,000 payment** |
| **`rel="noopener noreferrer"`** on invoice link | **Pass** | Verified in [PaymentRow.tsx](../../apps/web/components/payments/PaymentRow.tsx) |
| **Keyboard focus** on invoice link | **Pass** | After click: link `states: [active, focused]` |
| **Focus visible** on invoice link (WCAG 2.4.7) | **Fail → Fixed** | Was underline-only; added `focus-visible:ring-2` **brand** ring + offset (match **DealCard**) |
| Invoice page **title** reflects brand | **Pass** | Tab title **Invoice — tst** |
| Invoice **H1** + bill-to + deal + reference | **Pass** | Snapshot on invoice tab |
| Invoice **amount / status** in HTML | **Pass** | `curl` body: table rows **Amount**, **Status**; snapshot flattens table text |
| Invoice **semantic structure** (main + table name) | **Fail → Fixed** | Added `<main id="invoice-content">`, `table aria-label="Payment milestone details"` |
| Status human-readable (not raw enum) | **Fail → Fixed** | **RECEIVED** → **Received** in HTML for assistive tech + print |

## Follow-ups

- Re-run after deploy with production `NEXT_PUBLIC_API_URL`.  
- Optional: add a **visible** table caption for sighted users (currently `aria-label` only).
