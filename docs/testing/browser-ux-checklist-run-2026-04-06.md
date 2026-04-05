# Browser MCP UX checklist run

**Date:** 2026-04-06  
**Environment:** Next.js dev (`next dev`), base URL `http://localhost:3005`  
**Note:** `pnpm dev` from repo root failed to bind `@oompa/web` on `:3000` (EADDRINUSE). The browser session used a dedicated dev server on **3005** so the correct app was exercised.

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
