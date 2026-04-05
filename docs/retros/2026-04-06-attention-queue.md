# Retro: Attention queue
Shipped: 2026-04-06 (implementation + docs; deploy via your pipeline)

## What was built
Full overdue queue endpoint, dashboard total count + overflow link, `/attention` page, shell nav link, shared `collectPriorityActionsFromDeals` helper.

## Decisions
- **Single source of truth** for “what counts as overdue” in `priority-actions.ts` so dashboard and attention cannot drift.
- **Nav + overflow** so the queue is discoverable even before the user hits the cap.

## What to watch
Query cost is still one full deal graph per attention request — acceptable for Phase 1 portfolio sizes.

## What we’d do differently
Add lightweight E2E once Playwright (or similar) is in the repo for `/` → overflow → `/attention`.
