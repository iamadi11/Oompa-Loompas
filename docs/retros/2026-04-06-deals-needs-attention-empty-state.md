# Retro: Deals “needs attention” empty state

Shipped: 2026-04-06

## What was built

Contextual empty states for `DealList`: **all deals** vs **needs attention** filter, plus header **Add deal** visibility rules so the first-time empty view is not duplicated.

## Decisions

- Centralized copy in `lib/deal-list-empty.ts` to satisfy existing Vitest coverage scope (`lib/**/*.ts`) without adding RTL in this slice.
- **Deliverable UX doc** updated to reflect that **Undo** is already in `DeliverableRow` (doc had been stale).

## Critic user

A busy creator who clears their overdue queue should feel relief, not confusion. “You're all caught up” + **View all deals** answers “what next?” immediately.

## Post-deploy baseline

Capture qualitative feedback on the `/deals?needsAttention=true` zero-results screen within the next release cycle.

## What to watch

Unexpected duplicate CTAs on **All deals** empty (header vs body) — mitigated by hiding header **Add deal** when `!needsAttention && deals.length === 0`.

## What we’d do differently

If component coverage becomes a gate, add `@testing-library/react` + `jsdom` and snapshot-test `DealList` empty branches alongside the lib helper.
