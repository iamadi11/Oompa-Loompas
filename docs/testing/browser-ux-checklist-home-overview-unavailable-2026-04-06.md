# Browser MCP UX checklist — home overview unavailable state

**Date:** 2026-04-06  
**Latest MCP run:** 2026-04-06 (Cursor browser MCP) — `/` on **3010** with **`API_URL=http://127.0.0.1:59999`** (no listener): **Pass** (error path).  
**Base URL:** `http://localhost:3010`  
**Source:** [docs/ux/home-overview-unavailable-state.md](../ux/home-overview-unavailable-state.md)

## Preconditions

- From `apps/web`: `API_URL=http://127.0.0.1:59999 pnpm exec next dev -p 3010` (or any dead host/port) to force `getDashboardData()` → `null`.

## Results (vs UX doc)

| Item | UX doc section | Result | Notes |
|------|----------------|--------|-------|
| **H1** “We could not load your overview” | Error state | **Pass** | `level: 1` heading in snapshot. |
| Reassuring body copy (not “no deals”) | Error state | **Pass** | Exposed in page tree. |
| **Try again** `button` | User journey §3 | **Pass** | Present; shows **disabled** while `useTransition` pending after click. |
| Nav shell unchanged | web shell | **Pass** | Skip link, Revenue, Attention, Deals links present. |

## Success path (optional repeat)

- Run `@oompa/api` and web with `API_URL` / `NEXT_PUBLIC_API_URL` pointing at a healthy API; confirm empty vs ready states unchanged from prior dashboard checklists.

## Follow-ups

- Add E2E when harness can stub `GET /api/v1/dashboard` failure deterministically.
