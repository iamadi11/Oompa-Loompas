# Release **0.2.2** — deal pipeline stage strip (2026-04-09)

## Summary

Adds a **pipeline stage strip** to the `/deals` page: seven clickable tabs (All + 6 statuses) showing per-status deal counts. Clicking any tab filters the deal list to that stage. All counts are computed server-side from a single fetch — no new API endpoints, no client-side JavaScript, no migrations.

Also fixes two pre-existing `@typescript-eslint/no-unsafe-assignment` lint errors in API service test files introduced in the previous commit.

## Packages touched

| Package | Change |
|---------|--------|
| `@oompa/web` | `DealPipelineStrip`, `deals-page.ts` helpers, `deals/page.tsx` updated |

## New helpers

- `getDealStatusFilter(searchParams)` — validates and extracts `DealStatus | null` from URL params
- `computeStatusCounts(deals)` — pure function, zero-initialized record of counts per status

## Verification

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Browser: open `/deals` → see pipeline strip with counts; click any status tab → list filters; click "All" → returns to unfiltered view.

## Deploy ordering

Web only. No API changes, no migrations.
