# Browser MCP UX checklist run

**Date:** 2026-04-06  
**Latest MCP run:** 2026-04-06 (Cursor browser MCP, **sixth pass — agent**) — **Web:** `http://127.0.0.1:3007` (clean **`.next`** after **`rm -rf apps/web/.next`** + **`next dev -p 3007`** with **`API_URL` / `NEXT_PUBLIC_API_URL=http://127.0.0.1:3001`**), **API:** `http://127.0.0.1:3001`. **Full route sweep:** `/`, `/deals`, `/deals?needsAttention=true`, `/attention`, `/offline`, `/deals/new` → **create deal** → detail **`/deals/3195…`**; **payments:** add milestone, **Mark received**, **Delete** (confirm); **invoice** API tab: **`INV-*`**, toolbar, **`cache-control: no-store`** (**`curl -I`**); **deliverables:** add + **Delete** (confirm); **deal:** **Danger zone → Delete deal** (confirm) → redirect **`/deals`**; **`GET /manifest.webmanifest` → 200**. **`/deals/00000000-…`:** API **404** (curl); **Web** renders **Deal not found** + **Back to deals** without calling **`notFound()`** on the page (avoids Next 14 dev overlay / false-positive parallel-route error, [vercel/next.js#75310](https://github.com/vercel/next.js/issues/75310)) — response **HTTP 200** for that HTML page; **restart dev** after pull if HMR left a stale bundle.  
**Blocker found (fixed):** **`http://127.0.0.1:3005`** returned **500** / missing chunk (**`./958.js`**) from **stale `.next`** — same remediation as prior runs (**`rm -rf apps/web/.next`**, restart dev; use **`pnpm dev:clean`** on **3005** when possible).  
**Blocker found (fixed):** Client **`fetch`** from **`http://127.0.0.1:3007`** to API was **CORS-blocked** (preflight) because dev allowlist only listed specific ports. **Fix:** [`apps/api/src/plugins/cors.ts`](../../apps/api/src/plugins/cors.ts) now echoes **`Access-Control-Allow-Origin`** for any **`http://localhost:*`** / **`http://127.0.0.1:*`** in non-production, plus regression tests in [`cors.test.ts`](../../apps/api/src/__tests__/cors.test.ts). **Non-loopback LAN IPs are still denied.**  
**CRUD gaps closed (UI):** **Delete payment** (**[`PaymentRow.tsx`](../../apps/web/components/payments/PaymentRow.tsx)**), **Delete deal** (**[`DealForm.tsx`](../../apps/web/components/deals/DealForm.tsx)** danger zone), **Delete deliverable** confirm (**[`DeliverableRow.tsx`](../../apps/web/components/deliverables/DeliverableRow.tsx)**).  
**Tooling:** `next/link` client navigation via MCP click still unreliable — used **`browser_navigate`** for route changes (**unchanged**).  
**Earlier MCP run:** 2026-04-06 (Cursor browser MCP, **fifth pass — agent**) — **Web:** `http://127.0.0.1:3005`, **API:** `http://127.0.0.1:3001`. **Full route sweep:** `/` (Overview, What to do next, Recent deals, nav `aria-current`), `/deals`, `/deals?needsAttention=true`, `/attention`, `/offline`, `/deals/new` (create deal → redirect to detail), deal detail (add payment, cancel inline form, mark payment received, add deliverable, delete deliverable row present), `/deals/00000000-…` not-found, invoice HTML on API (`Print / Save as PDF`, `Copy link`, `Share…`, `Download HTML`, `INV-*`, `Cache-Control: no-store`). **`GET /manifest.webmanifest` → 200.** **Tooling:** `next/link` client navigation via MCP click still unreliable — used **`browser_navigate`** for route changes (**unchanged**).  
**Blocker found (fixed):** API returned **500** (`P2022` — column **`payments.invoice_number`** missing) until **`pnpm exec prisma migrate deploy`** was run from **`packages/db`** against local **`DATABASE_URL`**.  
**A11y fix shipped:** Duplicate **`id="notes"`** on deal detail (deal **Notes** textarea vs add-payment **Notes** input) caused accessibility tree **`Notes Notes (optional)`**. **Fix:** `deal-notes` for deal textarea; stable **`id`s** on add-payment and add-deliverable fields; payment/deliverable optional notes use label **`Notes (optional)`**.  
**Latest MCP run (historical):** 2026-04-06 (Cursor browser MCP, **fourth pass — agent**) — **Web:** `http://127.0.0.1:3005`, **API:** `http://127.0.0.1:3001`. **Regression found:** **`/deals/[id]`** showed Next error **`Cannot find module './808.js'`** (stale **`.next`**). **Fix:** `kill` the listener on **:3005**, **`rm -rf apps/web/.next`**, restart **`pnpm exec next dev -p 3005`** (or **`pnpm dev:clean`**) from **`apps/web`** with **`API_URL` / `NEXT_PUBLIC_API_URL`**. **After restart:** `/`, `/deals`, `/deals?needsAttention=true`, `/attention`, `/deals/new`, `/offline`, deal detail, invoice tab — **Pass** in MCP snapshots. **Tooling:** `browser_click` on **`next/link`** still does not client-navigate (**unchanged**). **DB:** added missing **`packages/db/src/seed.ts`** so **`pnpm db:seed`** runs (idempotent skip when deals exist).  
**Environment:** Next.js dev — prefer **`http://127.0.0.1:3005`** with **`pnpm dev:clean`**; any loopback port works with the API after the **CORS** update (sixth pass used **:3007** after a clean **`.next`**).  
**Note:** `pnpm dev` from repo root may fail to bind `@oompa/web` on `:3000` (EADDRINUSE). From **`apps/web`**: `API_URL=http://127.0.0.1:3001 NEXT_PUBLIC_API_URL=http://127.0.0.1:3001 pnpm dev:clean` after **`rm -rf .next`** if you see **missing chunk** (**`./808.js`**, **`./958.js`**) or **500 on `/`**.

## Sources

- [docs/ux/web-shell-pwa.md](../ux/web-shell-pwa.md)
- [docs/ux/deal-crud.md](../ux/deal-crud.md) (accessibility + form expectations)
- [docs/testing/pwa-web-client.md](./pwa-web-client.md) (manual acceptance + a11y)

## Results

| Item | Source | Result | Notes |
|------|--------|--------|--------|
| Global shell: brand + Deals nav | web-shell | **Pass** | Links “Revenue”, “Attention”, “Deals”; `nav` “Main”; **MCP 2026-04-06:** `states: [current]` on **Revenue** (`/`), **Attention** (`/attention`), **Deals** (`/deals`). |
| Skip link | web-shell / deal-crud a11y | **Pass** | “Skip to main content” present |
| Offline copy (connection required for money) | web-shell | **Pass** | H1 “You are offline”; body states deals/payments/balances need internet |
| Manifest JSON (name, icons, display, theme) | pwa testing | **Pass** | `GET /manifest.webmanifest` returned valid JSON with expected fields |
| Service worker in dev | pwa testing | **Pass** | Console: “PWA support is disabled” (expected for `NODE_ENV=development`) |
| Install / Lighthouse | pwa testing | **N/A** | Not run in this session (dev build) |
| Offline network-off behavior | pwa testing | **N/A** | MCP did not simulate offline; copy verified on `/offline` route |
| Dashboard “what next” (CTA / overview) | deal-crud / SOT | **Pass** | Overview with “+ New deal”, “View all”, recent deals |
| New deal form labels + controls | deal-crud | **Pass** | Named textboxes, combobox, buttons with accessible names |
| Document title (no duplicate app name) | — | **Fail → Fixed** | Was `New Deal — Revenue · Revenue`; metadata title set to `New deal` |
| Focus visible: shell + text links + cards | deal-crud a11y / pwa testing §5 | **Fail → Fixed** | Added `focus-visible:ring-*` to header links, “View all”, `DealCard`, `RecentDealRow`, offline + not-found links |
| Dev server **500** (missing chunk e.g. `./808.js`, `./958.js`) | — | **Fail → Fixed (ops)** | Stale **`.next`** after HMR/updates. **Fix:** remove **`apps/web/.next`**, restart dev from **`apps/web`** with API env; or **`pnpm dev:clean`** (same + **3005**). **`GET /` → 200** after this run. |
| Deals list **document title** (tab / SR document name) | shell quality | **Fail → Fixed** | `/deals` and `/deals?needsAttention=true` used root default title; added `generateMetadata` on `app/deals/page.tsx` → **`Deals · Revenue`** / **`Needs attention · Revenue`**. |
| **Dev CORS** for web on **`next dev -p`** (e.g. **:3005**, **:3007**) | client `fetch` / deal-crud | **Fail → Fixed** | API dev CORS only listed **:3000**; **`Mark received`**, forms, etc. could fail. **`cors.ts`** now allows any **`http://127.0.0.1:*`** / **`http://localhost:*`** in non-production (loopback only); tests in [`cors.test.ts`](../../apps/api/src/__tests__/cors.test.ts). **Restart API** after pull. |
| Orphan **Next** on **:3005** → **`GET /` 404** | ops | **Fail → Fixed (ops)** | Kill stale listener; run **`pnpm dev:clean`** from **`apps/web`**. |
| React **hydration** warning **`data-cursor-ref`** on deal page | MCP / tooling | **N/A** | Injected by Cursor Browser MCP for snapshots; not present in production HTML. |
| API **500** on payments (`P2022` missing **`invoice_number`**) | ops / schema | **Fail → Fixed** | From **`packages/db`**, run **`pnpm exec prisma migrate deploy`** after pulls that add invoice columns. |
| Deal detail **duplicate `id="notes"`** (stacked forms) | deal-crud a11y | **Fail → Fixed** | `DealForm` textarea **`deal-notes`**; add-payment / add-deliverable inputs use unique **`id`**; optional notes labels clarified. |
| **Delete payment** / **delete deal** in UI | CRUD completeness | **Pass** | **Delete** on each payment row (confirm); **Danger zone → Delete deal** on edit form (confirm → **`/deals`**). |
| **Stale `.next`** (**`./958.js`**, **`./808.js`**) on **:3005** | ops | **Fail → Fixed (ops)** | **`rm -rf apps/web/.next`** + restart; sixth pass used **:3007** with clean cache. |

## Follow-ups

- Re-run on **production** `next start` for SW + installability (Lighthouse) and true offline fetch behavior.
- If `pnpm dev` should always win port 3000, free the conflicting process or document a standard alternate port.
- If **`/attention`** or **`/deals`** returns **404** while `/` works on the same port, restart `next dev` from `apps/web` with `API_URL` / `NEXT_PUBLIC_API_URL` (stale or mis-rooted process).

---

## Addendum — same day (dashboard / attention / deals filter)

Cross-doc runs logged in:

- [browser-ux-checklist-dashboard-priority-actions-2026-04-06.md](./browser-ux-checklist-dashboard-priority-actions-2026-04-06.md)
- [browser-ux-checklist-attention-queue-2026-04-06.md](./browser-ux-checklist-attention-queue-2026-04-06.md)
- [browser-ux-checklist-deals-needs-attention-2026-04-06.md](./browser-ux-checklist-deals-needs-attention-2026-04-06.md)

**Summary:** Local dev **3005** — home, deals (all + needs attention), attention queue: **Pass** after **`next dev` restart** when `/attention` had been **404**. Main nav **`aria-current`** verified via MCP `states: [current]`. **Nav link click** in MCP still does not perform client navigation (**tooling**). **Needs-attention empty** and **attention empty/error** paths still not live-exercised with this fixture.

- **Payment invoice (v1):** [browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md](./browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md)
