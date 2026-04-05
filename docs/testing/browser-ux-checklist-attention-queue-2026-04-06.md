# Browser MCP UX checklist — dashboard priority actions + attention queue

**Date:** 2026-04-06 (re-run)  
**Latest MCP run:** 2026-04-06 — home `/` + `/attention` snapshots; **Pass** on all items below except **Nav click (tooling)** unchanged.  
**Base URL:** `http://localhost:3005` (Next dev; API `http://localhost:3001`)  
**Sources:** [docs/ux/dashboard-priority-actions.md](../ux/dashboard-priority-actions.md), [docs/ux/attention-queue.md](../ux/attention-queue.md)

## Preconditions

- API + web dev servers running; web env has `API_URL` / `NEXT_PUBLIC_API_URL` → API.
- If Next returns **500** with `Cannot find module './NNN.js'`, restart `next dev` (stale chunk / HMR state).

## Dashboard priority actions (re-check)

| Item | Source | Result | Notes |
|------|--------|--------|-------|
| **Attention** in main nav | attention-queue §2 | **Pass** | Snapshot: link “Attention” before “Deals”. |
| **What to do next** above financial summary | dashboard §2 | **Pass** | Region + H2 present when overdue data exists. |
| Helper copy + `aria-describedby` | dashboard a11y | **Pass** | Section described by helper paragraph id. |
| Chase / Ship copy + amount / due | dashboard §3 | **Pass** | Row accessible name includes action type and amount. |
| **View all N items** when `totalCount > 10` | dashboard §3 | **N/A** | Latest run: still `priorityActionsTotalCount === 1`; overflow link to `/attention` correctly hidden. Home **Recent deals** link remains **View all** → `/deals` per [revenue-dashboard.md](../ux/revenue-dashboard.md) (not the priority overflow control). |
| Nav **click** navigates | attention-queue §2 | **Fail (tooling)** | `browser_click` on header `<a href="/attention">` did not change URL; **direct** `browser_navigate` to `/attention` works. Native anchors are correct in DOM. |

## Attention queue page

| Item | Source | Result | Notes |
|------|--------|--------|-------|
| Document title | metadata | **Pass** | `Attention · Revenue`. |
| **Has items:** H1 “Needs your attention” | attention-queue §3 | **Pass** | `level: 1`. |
| Count subtitle | attention-queue §3 | **Pass** | Associated via `aria-describedby` after fix (`attention-queue-summary`). |
| List region | attention-queue a11y | **Pass → Fixed** | Added `<section aria-labelledby>` + sr-only H2 “Overdue items”. |
| Row link to deal | attention-queue §3 | **Pass** | Same row pattern as home (“Chase payment · …”). |
| **← Overview** link | journey | **Pass** | Present with accessible name. |
| **Empty / error** states | attention-queue §2 | **Not exercised** | Would require API down or zero overdue; copy + `aria-describedby` added for error/empty H1s in code. |

## Code fixes this run

1. **Attention page:** `aria-describedby` on all H1s; list wrapped in **landmarked section** with sr-only **H2** “Overdue items”.
2. **Operational:** Restarted `next dev` on 3005 after **500** + missing chunk error so MCP could load `/`.

## Follow-ups

- Manually verify empty and API-down states once.
- When `priorityActionsTotalCount > 10`, re-run to confirm **View all N items** and full parity on `/attention`.
