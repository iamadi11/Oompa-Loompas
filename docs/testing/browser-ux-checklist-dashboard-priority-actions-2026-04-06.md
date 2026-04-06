# Browser MCP UX checklist — dashboard priority actions

**Date:** 2026-04-06  
**Latest MCP run:** 2026-04-06 (agent) — `/` on **3005** after **`.next` clean** + **`next dev -p 3005`**: **What to do next**, **Financial summary**, **Recent deals**; **Revenue** `states: [current]`; **Pass**.  
**Base URL:** `http://localhost:3005` (Next dev; `@oompa/api` on `http://localhost:3001`)  
**Source:** [docs/ux/dashboard-priority-actions.md](../ux/dashboard-priority-actions.md)

## Preconditions

- API and web dev servers running with `API_URL` / `NEXT_PUBLIC_API_URL` pointing at the API.
- For **success-path** checks, at least one overdue payment or overdue PENDING deliverable must exist (otherwise `priorityActions` is empty by design).
- If **`curl -s -o /dev/null -w '%{http_code}' http://localhost:3005/attention`** prints **404** while `/` is **200**, the dev server on that port is **stale or wrong tree** — stop it and restart from `apps/web`: `API_URL=http://localhost:3001 NEXT_PUBLIC_API_URL=http://localhost:3001 pnpm exec next dev -p 3005`.

## Results (vs UX doc)

| Item | UX doc section | Result | Notes |
|------|----------------|--------|-------|
| **What to do next** block above summary when actions exist | User journey §2 | **Pass** | Region named “What to do next”; appears above “Financial summary” in a11y snapshot. |
| **H2** “What to do next” | Accessibility | **Pass** | `level: 2` heading present. |
| **Helper copy** (overdue + open deal) | Success state | **Pass** | Descriptive text exposed in tree; section uses `aria-describedby` after fix. |
| **Chase payment** copy + amount + relative due | Success state | **Pass** | e.g. “Chase payment · test ₹50,000 · due 6 years ago” (relative string depends on fixture date). |
| **Link to deal** (`/deals/:id`) | User journey §3 | **Pass** | Verified by opening `/deals/{dealId}` in the same session; deal page shows payment actions (e.g. “Mark payment … as received”). Automated `browser_click` on the Next `Link` did not change URL in MCP (likely client-navigation + automation); `href` on the row is correct. |
| **Zero state** (no block when nothing overdue) | States | **Pass** | Verified earlier with `priorityActions: []` (no “What to do next” region). |
| **Semantic list** | Accessibility | **Pass (mitigated)** | MCP snapshot flattens tree (`listitem` may appear without parent `list` in YAML). `ul` now has explicit `role="list"` to counter Tailwind preflight `list-style: none` stripping list semantics in some engines. |
| **Focus ring on priority links** | Accessibility | **Pass** | Component sets `focus-visible:ring-2` + offset; global `*:focus-visible` outline in `globals.css`. |
| **Plain language, not color-only** | Accessibility | **Pass** | Action type in text (“Chase payment” / “Ship deliverable”); amber panel is decorative only. |
| **Main nav `aria-current` on home** | [web-shell-pwa.md](../ux/web-shell-pwa.md) | **Pass** | `/` — link “Revenue” has `states: [current]`; Attention + Deals do not. |
| **Document title on deal detail** | Related shell quality | **Fail → Fixed** | Was `test — Revenue · Revenue` because `generateMetadata` duplicated the app name with the root `title.template`. Set segment title to deal title only → `test · Revenue`. |

## Follow-ups

- Re-run click-through with browser **unlocked** if validating client-side `Link` navigation via automation.
- If Next dev shows “React Client Manifest” errors after rapid HMR, restart `next dev` (transient bundler state).
