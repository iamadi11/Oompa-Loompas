# Browser MCP UX checklist — home overview unavailable state

**Date:** 2026-04-06  
**Latest MCP run:** 2026-04-06 (Cursor browser MCP) — **ports 3035 / 3036**; **`@oompa/api`** started on **:3001** before success-profile checks.  
**Source:** [docs/ux/home-overview-unavailable-state.md](../ux/home-overview-unavailable-state.md)  
**Reference:** [docs/ux/web-shell-pwa.md](../ux/web-shell-pwa.md) (global nav)

## Dev URLs used this run

| Profile | Next URL | `API_URL` / `NEXT_PUBLIC_API_URL` | Purpose |
|--------|----------|-----------------------------------|---------|
| **A — error** | `http://localhost:3035` | `http://127.0.0.1:59999` (no server) | Force `getDashboardData()` → `null` |
| **B — success** | `http://localhost:3036` | `http://127.0.0.1:3001` (live `@oompa/api`) | Dashboard with data |

Use **two free ports** if **3020/3021** or **3000** are already taken (`EADDRINUSE`).

### Commands (repeat this run)

```bash
# Terminal 1 — API (required for profile B)
cd apps/api && pnpm dev

# Terminal 2 — success profile (example port 3036)
cd apps/web && API_URL=http://127.0.0.1:3001 NEXT_PUBLIC_API_URL=http://127.0.0.1:3001 pnpm exec next dev -p 3036

# Terminal 3 — error profile (example port 3035)
cd apps/web && API_URL=http://127.0.0.1:59999 NEXT_PUBLIC_API_URL=http://127.0.0.1:59999 pnpm exec next dev -p 3035
```

## Results (vs UX doc) — error path (profile **A**, `/` on **3035**)

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

## Results — success path sanity (profile **B**, `/` on **3036**)

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

_None this run — all checked rows **Pass**._

Prior pass: **`OverviewFetchError`** **`section`** + **`aria-labelledby` / `aria-describedby`**, **`aria-live="polite"`**, **`aria-busy`**.

## Follow-ups

- Add E2E when harness can stub `GET /api/v1/dashboard` failure deterministically.
- Re-check **zero deals** row after DB reset or dedicated fixture.

## MCP environment note

If the embedded browser shows only **Reload** / **Show Details** for `http://localhost:<port>/`, the dev server is not reachable from that browser context (wrong port, server stopped, or isolation). Confirm **Next** logs show **Ready** and try another free port.
