# Browser MCP UX checklist — home overview unavailable state

**Date:** 2026-04-06  
**Latest MCP run:** 2026-04-06 (Cursor browser MCP) — see **Results** below.  
**Source:** [docs/ux/home-overview-unavailable-state.md](../ux/home-overview-unavailable-state.md)  
**Reference:** [docs/ux/web-shell-pwa.md](../ux/web-shell-pwa.md) (global nav)

## Dev URLs used this run

| Profile | Next URL | `API_URL` / `NEXT_PUBLIC_API_URL` | Purpose |
|--------|----------|-----------------------------------|---------|
| **A — error** | `http://localhost:3021` | `http://127.0.0.1:59999` (no server) | Force `getDashboardData()` → `null` |
| **B — success** | `http://localhost:3020` | `http://localhost:3001` (live `@oompa/api`) | Dashboard with data |

Default local **Next** is port **3000** (`pnpm dev` from `apps/web`); **3020/3021** were used here to avoid **EADDRINUSE** on **3000**.

### Commands (repeat this run)

```bash
# Terminal 1 — API (already running in many setups on :3001)
cd apps/api && pnpm dev

# Terminal 2 — success profile
cd apps/web && API_URL=http://localhost:3001 NEXT_PUBLIC_API_URL=http://localhost:3001 pnpm exec next dev -p 3020

# Terminal 3 — error profile
cd apps/web && API_URL=http://127.0.0.1:59999 NEXT_PUBLIC_API_URL=http://127.0.0.1:59999 pnpm exec next dev -p 3021
```

## Results (vs UX doc) — error path (profile **A**, `/` on **3021**)

| Item | UX doc section | Result | Notes |
|------|----------------|--------|-------|
| Load failure **not** onboarding (no “Add your first deal”) | Error state | **Pass** | Primary content is error `h1` + reassurance + **Try again** only. |
| **H1** “We could not load your overview” | Error state | **Pass** | `level: 1` in a11y snapshot. |
| Reassurance body copy (data not deleted, check API) | Error state | **Pass** | Wired via `aria-describedby` on **`section`**. |
| **`section`** region named from `h1` | Accessibility | **Pass** | Snapshot: `role: region`, `name: We could not load your overview` (post-fix). |
| **Try again** `button` | User journey §3 | **Pass** | Present; uses shared **`Button`** (shows **disabled** while `useTransition` pending after click — verified earlier in session). |
| **Skip to main content** link | web shell | **Pass** | Present; target **`#main-content`** exists in root layout. |
| **Revenue** `aria-current` on home | web shell §Global navigation | **Pass** | `states: [current]` on **Revenue** link. |
| **`nav` `aria-label="Main"`** | web shell | **Pass** | `role: navigation`, `name: Main`. |
| **Attention** / **Deals** links | web shell | **Pass** | Present (no erroneous `current` on those routes). |

## Results — success path sanity (profile **B**, `/` on **3020**)

| Item | UX doc section | Result | Notes |
|------|----------------|--------|-------|
| Does **not** show error `h1` when API is healthy | Success | **Pass** | Page **`h1`** is **Overview**; priority actions + summary + recent deals render. |
| **Revenue** `aria-current` on home | web shell | **Pass** | `states: [current]` on **Revenue**. |

## Optional (not run / N/A)

| Item | Result | Notes |
|------|--------|-------|
| **Zero deals** empty state with live API | **N/A** | Local DB had deals (`totalDealsCount` &gt; 0); empty copy unchanged by this feature — re-run when DB has zero deals. |
| Focus ring **pixels** on **Try again** | **Pass (by implementation)** | MCP snapshot does not expose `:focus-visible`; **`Button`** applies `focus-visible:ring-2` per design system. |

## Fixes applied from this checklist pass

1. **`OverviewFetchError`:** wrap copy in **`section`** with **`aria-labelledby`**, **`aria-describedby`**, **`aria-live="polite"`**, **`aria-busy={pending}`** so the error is a proper region and retries expose busy state (avoids relying on a flat `h1` + loose text in the a11y tree).

## Follow-ups

- Add E2E when harness can stub `GET /api/v1/dashboard` failure deterministically.
- Re-check **zero deals** row after DB reset or dedicated fixture.
