# Browser MCP UX checklist run

**Date:** 2026-04-06  
**Latest MCP run:** 2026-04-06 (Cursor browser MCP, **repeat**) — **`GET /` was 500** (`Cannot find module './958.js'`, stack via **`pages/_document`**) until **`rm -rf apps/web/.next`** + **`next dev -p 3005`** from **`apps/web`** with API env. Then **`/`, `/attention`, `/deals`, `/deals?needsAttention=true`, `/offline`, `/deals/new`** — **Pass**; manifest **`curl`** — **Pass**. **Recovery:** use **`pnpm dev:clean`** from **`apps/web`** (deletes **`.next`**, serves **3005**) + **`API_URL` / `NEXT_PUBLIC_API_URL`**.  
**Environment:** Next.js dev (`next dev`), base URL `http://localhost:3005`  
**Note:** `pnpm dev` from repo root may fail to bind `@oompa/web` on `:3000` (EADDRINUSE). Prefer **`apps/web`**: `API_URL=http://localhost:3001 NEXT_PUBLIC_API_URL=http://localhost:3001 pnpm dev:clean` or `pnpm exec next dev -p 3005` after a clean **`.next`** if you see **missing chunk** errors.

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
