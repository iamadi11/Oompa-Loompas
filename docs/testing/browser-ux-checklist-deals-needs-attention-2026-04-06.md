# Browser MCP UX checklist — deals “needs attention” filter

**Date:** 2026-04-06 (post-filter ship)  
**Latest MCP run:** 2026-04-06 (Cursor browser MCP) — after **`.next` clean** + dev on **3005**: `/deals`, `/deals?needsAttention=true`, `/attention` — **200**; main nav **Deals** `states: [current]`; filter `aria-current` **Pass**; footer **Browse deals with overdue work** `href` **`/deals?needsAttention=true`** (**Pass**). **Document titles:** **`Deals · Revenue`** / **`Needs attention · Revenue`** (**Pass**) via `generateMetadata` on `app/deals/page.tsx`.  
**Base URL:** `http://localhost:3005` (Next dev; API `http://localhost:3001`)  
**Source:** [docs/ux/deals-needs-attention-filter.md](../ux/deals-needs-attention-filter.md)

## Preconditions

- API + web dev servers running; web env has `API_URL` / `NEXT_PUBLIC_API_URL` → API.
- If `/` returns **500** with a missing chunk (`Cannot find module './NNN.js'`), restart `next dev` on 3005 (same as [attention-queue checklist](./browser-ux-checklist-attention-queue-2026-04-06.md)).
- If app routes return **404** in browser/MCP while `/` is fine, restart dev from `apps/web` on this port ([attention-queue checklist](./browser-ux-checklist-attention-queue-2026-04-06.md) § Preconditions).

## Checklist

| Item | Source | Result | Notes |
|------|--------|--------|-------|
| **Main nav `aria-current` on deals** | [web-shell-pwa.md](../ux/web-shell-pwa.md) | **Pass** | `/deals` and `/deals?needsAttention=true` — “Deals” `states: [current]` (alongside filter `aria-current` on All / Needs attention). |
| **Deal filters** nav present | a11y | **Pass** | `navigation` name “Deal filters”. |
| **All deals** default; `aria-current="page"` when active | journey + a11y | **Pass** | `/deals` — “All deals” has `states: [current]`; “Needs attention” does not. |
| **Needs attention** active state | journey + a11y | **Pass** | `/deals?needsAttention=true` — “Needs attention” has `states: [current]`. |
| **All deals** subtitle = deal count | states | **Pass** | “4 deals” with fixture data. |
| **Needs attention** subtitle = overdue copy | states | **Pass** | “1 deal with overdue work” with fixture data. |
| **Document title** (deals + filtered) | shell / tabs | **Pass** | MCP document name: **`Deals · Revenue`** on `/deals`, **`Needs attention · Revenue`** on `?needsAttention=true` (after `generateMetadata` fix). |
| **Attention** footer link applies filter | states | **Pass** | Link “Browse deals with overdue work” `href` = `/deals?needsAttention=true` (attribute check). |
| **Zero** needs-attention list | states | **Pass (copy); live N/A** | Fixture still has overdue work → list not empty in browser. Copy + `DealList` covered by unit tests; manual browser when DB has zero overdue rows. |

## Cross-check (dashboard / attention unchanged)

| Item | Result | Notes |
|------|--------|-------|
| Home **What to do next** | **Pass** | Region + priority row present. |
| `/attention` structure | **Pass** | H1, section “Overdue items”, footer link present. |

## Code fixes this run

**2026-04-06 (latest):** **Operational** — restarted `next dev` on **3005** from `apps/web` (with API env) so **`/attention`** / **`/deals`** were no longer **404** in MCP. Product snapshots then matched UX; **Browse deals with overdue work** `href` = `/deals?needsAttention=true` (attribute check on `/attention`).

**2026-04-06 (Cursor MCP):** **Stale build** — **`Cannot find module './NNN.js'`** on **`/`** → removed **`apps/web/.next`**, restarted dev on **3005**. **Product** — **`generateMetadata`** on **`app/deals/page.tsx`** for segment titles **`Deals`** / **`Needs attention`** (resolves **`Deals · Revenue`** / **`Needs attention · Revenue`** with root template).
