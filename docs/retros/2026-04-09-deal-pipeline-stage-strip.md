# Retro: Deal pipeline stage strip
Shipped: 2026-04-09

## What Was Built

A server-side pipeline stage strip on `/deals` — seven tab links (All + 6 deal statuses) showing per-status counts. Clicking a tab filters the deal list to that stage. Zero new API endpoints, no migrations, no client-side JavaScript. Two pre-existing lint errors in API service test files also fixed.

## Decisions Made (and why)

1. **Server-side filter over API param filter** — fetch all deals once, compute counts, filter in the RSC. Avoids two API calls and keeps the component stateless.
2. **Pure `<Link>` tabs over client state** — no `useState`, no hydration cost, keyboard-navigable out of the box, works without JS.
3. **`DealStatusSchema.safeParse` for input validation** — reuses existing Zod schema; silently ignores crafted/invalid URL params rather than crashing.
4. **Flex-wrap layout** — Cancelled drops to a second row on narrow viewports rather than truncating. Tested in browser at ~375px.

## What the Critic User Said

"I can see exactly how many deals are stuck in 'Delivered' — two clicks and I'm chasing payment." The filter is obvious and the empty states are handled gracefully. Hardest part: avoiding a cluttered feel with 7 tabs; solved by keeping them small (`text-xs`), consistent, and using dots as color identifiers rather than large badges.

## Post-Deploy Baseline

- `?status=DELIVERED` page views: 0 (new; watch for non-zero at day 7)
- `?status=ACTIVE` page views: 0 (new; watch for non-zero at day 7)
- `overdue_payment` action count: baseline from existing dashboard

## What To Watch

| Signal | Threshold | Owner |
|--------|-----------|-------|
| `?status=DELIVERED` usage | Any non-zero in 7 days = feature discovered | Review at day 7 |
| Overdue payment count trend | Downward over 2 weeks = outcome achieved | Review at day 14 |

## What We'd Do Differently

- The Turbopack dev server (`next dev`) had a compilation hang on the marketing landing page (pre-existing, unrelated to this change). Production build (`next build + start`) was used for browser validation instead. The `web-prod` launch config was added to `.claude/launch.json` to make this repeatable.
- Next time: validate on prod build first when Turbopack is known to be slow.
