# Browser MCP UX checklist — home overview unavailable state

**Date:** 2026-04-06  
**Latest MCP run:** 2026-04-06 (Cursor browser MCP) — **`http://127.0.0.1:3040`** / **`http://127.0.0.1:3041`**; **`@oompa/api`** on **:3001** (dashboard **200**).  
**Source:** [docs/ux/home-overview-unavailable-state.md](../ux/home-overview-unavailable-state.md)  
**Reference:** [docs/ux/web-shell-pwa.md](../ux/web-shell-pwa.md) (global nav)

## Dev URLs used this run

| Profile | Next URL | `API_URL` / `NEXT_PUBLIC_API_URL` | Purpose |
|--------|----------|-----------------------------------|---------|
| **A — error** | `http://127.0.0.1:3040` | `http://127.0.0.1:59999` (no server) | Force `getDashboardData()` → `null` |
| **B — success** | `http://127.0.0.1:3041` | `http://127.0.0.1:3001` (live `@oompa/api`) | Dashboard with data |

**Embedded browser:** `http://localhost:<port>/` may resolve to **`about:blank`** in this environment; use **`http://127.0.0.1:<port>/`** for MCP (see **Fixes applied**).

### Commands (repeat this run)

```bash
# Terminal 1 — API (required for profile B)
cd apps/api && pnpm dev

# Terminal 2 — success profile
cd apps/web && API_URL=http://127.0.0.1:3001 NEXT_PUBLIC_API_URL=http://127.0.0.1:3001 pnpm exec next dev -p 3041

# Terminal 3 — error profile
cd apps/web && API_URL=http://127.0.0.1:59999 NEXT_PUBLIC_API_URL=http://127.0.0.1:59999 pnpm exec next dev -p 3040
```

**Browser MCP:** open **`http://127.0.0.1:3040/`** and **`http://127.0.0.1:3041/`** (not `localhost` if you see a blank document).

## Results (vs UX doc) — error path (profile **A**, `/` on **3040**)

| Item | UX doc section | Result | Notes |
|------|----------------|--------|-------|
| Load failure **not** onboarding (no “Add your first deal”) | Error state | **Pass** | Error `h1` + reassurance + **Try again** only. |
| **H1** “We could not load your overview” | Error state | **Pass** | `level: 1` in a11y snapshot. |
| Reassurance body copy (data not deleted, check API) | Error state | **Pass** | Associated via **`section`** / `aria-describedby` (MCP may flatten heading siblings). |
| **`section`** region named from `h1` | Accessibility | **Pass** | `role: region`, `name: We could not load your overview`. |
| **Try again** `button` | User journey §3 | **Pass** | Present; uses shared **`Button`**. |
| **Try again** **disabled** while retry in flight | Accessibility / UX | **Pass** | After click: `states: [disabled]` until transition completes. |
| **Skip to main content** link | web shell | **Pass** | Present; target **`#main-content`** in root layout. |
| **Revenue** `aria-current` on home | web shell §Global navigation | **Pass** | `states: [current]` on **Revenue**. |
| **`nav` `aria-label="Main"`** | web shell | **Pass** | `role: navigation`, `name: Main`. |
| **Attention** / **Deals** links | web shell | **Pass** | Present; no erroneous `current` on those routes. |

## Results — success path sanity (profile **B**, `/` on **3041**)

| Item | UX doc section | Result | Notes |
|------|----------------|--------|-------|
| Does **not** show error `h1` when API is healthy | Success | **Pass** | Page **`h1`** is **Overview**; priority actions + summary + recent deals render. |
| **Revenue** `aria-current` on home | web shell | **Pass** | `states: [current]` on **Revenue**. |

## Optional (not run / N/A)

| Item | Result | Notes |
|------|--------|-------|
| **Zero deals** empty state with live API | **N/A** | Local DB had deals (`totalDealsCount` &gt; 0); re-run when DB has zero deals. |
| Focus ring **pixels** on **Try again** | **Pass (by implementation)** | MCP snapshot does not expose `:focus-visible`; **`Button`** applies `focus-visible:ring-2`. |
| **`aria-busy`** on error **section** while pending | **Pass (by implementation)** | Not exposed in YAML snapshot; set in [OverviewFetchError.tsx](../../apps/web/components/dashboard/OverviewFetchError.tsx). |

## Fixes applied from this checklist pass

1. **MCP + `localhost`:** **`browser_navigate` to `http://localhost:3040/`** produced **`about:blank`** (no interactive tree). **Retry with `http://127.0.0.1:3040/`** — **Pass**. Checklist commands and URLs updated to prefer **`127.0.0.1`** for automated browser runs.

Prior: **`OverviewFetchError`** **`section`** + **`aria-labelledby` / `aria-describedby`**, **`aria-live="polite"`**, **`aria-busy`**.

## Follow-ups

- Add E2E when harness can stub `GET /api/v1/dashboard` failure deterministically.
- Re-check **zero deals** row after DB reset or dedicated fixture.

## MCP environment note

If the embedded browser shows **`about:blank`** or only **Reload** / **Show Details**, try **`127.0.0.1`** instead of **`localhost`**, confirm **Next** logs show **Ready**, and pick unused ports (e.g. **3040** / **3041**) if **EADDRINUSE**.
