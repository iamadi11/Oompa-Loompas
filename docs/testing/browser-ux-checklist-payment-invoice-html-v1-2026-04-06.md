# Browser MCP UX checklist — payment invoice HTML (v1)

**Date:** 2026-04-06  
**Environment:** Next.js dev `http://127.0.0.1:3005`, API `http://127.0.0.1:3001` (`API_URL` / `NEXT_PUBLIC_API_URL` aligned).  
**Latest MCP re-check:** 2026-04-06 (agent, **sixth pass**) — Deal detail on **`http://127.0.0.1:3007`**, invoice URL on API **`http://127.0.0.1:3001`**. Snapshot: **Invoice — `INV-*`**, **H1**, toolbar buttons, supplier placeholder + **Bill to** brand; **`curl -I`** on invoice URL → **`cache-control: no-store`**. **View invoice** link: **`aria-label`** includes formatted amount (verified on payment row before delete).  
**Earlier MCP re-check:** 2026-04-06 (agent, **fifth pass**) — **`http://127.0.0.1:3005`** + API **`http://127.0.0.1:3001`**. After **`prisma migrate deploy`** (fixes **`P2022`** on **`payments.invoice_number`**). Invoice HTML (structured v2): **`<main id="invoice-content">`**, **H1** + **INV-*** sequential number + issue date, line-items / totals / payment-status tables, **toolbar** (Print/Save PDF, Copy link, Share, Download HTML), **`Cache-Control: no-store`**. **View invoice** link on deal detail: **`aria-label`** with amount, opens API URL (new tab not exercised in this pass; same as prior runs).  
**Earlier MCP re-check:** 2026-04-06 (agent) — after **`rm -rf apps/web/.next`** + **`next dev -p 3005`** restart (recovered **`/deals/[id]`** from **`Cannot find module './808.js'`**). Invoice HTML v1: **`curl`** confirmed **`<main id="invoice-content">`**, legacy **`table aria-label="Payment milestone details"`**, **`cache-control: no-store`**.  
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
| Invoice **semantic structure** (main + tables) | **Pass** (v2) | `<main id="invoice-content">`; line items + totals + payment status tables (replaces single **Payment milestone details** table from v1). |
| Status human-readable (not raw enum) | **Fail → Fixed** | **RECEIVED** → **Received** in HTML for assistive tech + print |
| **MCP regression sweep** (2026-04-06) | **Pass** | Deal with payments: **Payments** region, **View printable invoice…** links, **`rel`/`target`**; empty deal **bf97…**: no invoice links; invoice URL: title **Invoice — tst**, **H1** + reference; HTML contains **`<main id="invoice-content">`**, **`table aria-label="Payment milestone details"`** (`curl`); **`Cache-Control: no-store`**. |
| **MCP sweep** (2026-04-06, fifth pass) | **Pass** | Deal detail: invoice link + **Payments** region; API invoice page: **Print / Save as PDF**, **Copy link**, **Share…**, **Download HTML**, **Invoice — INV-*** title; **`curl -I`** → **`cache-control: no-store`**. |
| **MCP sweep** (2026-04-06, sixth pass) | **Pass** | Same checks on **:3007** + clean **`.next`**; invoice title **Invoice — INV-00000002**; toolbar + structured regions in snapshot. |
| **API 500** (`P2022` missing **`invoice_number`**) | **Fail → Fixed (ops)** | From **`packages/db`**: `pnpm exec prisma migrate deploy` (with **`DATABASE_URL`**) so payment list/invoice routes work. |
| **Stale `.next` → deal detail 500** (`./808.js`) | **Fail → Fixed (ops)** | Next dev overlay until **`.next` deleted** and dev server restarted from **`apps/web`** with API env. |

## Follow-ups

- Re-run after deploy with production `NEXT_PUBLIC_API_URL`.  
- Optional: add a **visible** table caption for sighted users (currently `aria-label` only).
