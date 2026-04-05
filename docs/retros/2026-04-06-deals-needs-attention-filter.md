# Retro: Deals “needs attention” filter
Shipped: 2026-04-06 (code + docs; deploy via your pipeline)

## What was built
Query param + Prisma filter, deals page toggle nav, attention page cross-link, tests.

## Decisions
- **Normalized `where` with `AND`** for all list filters so adding filters stays predictable.
- **String enum** for `needsAttention` in schema (no Zod transform) to keep `validate()` typing stable.

## What to watch
OR filter + pagination: deals with both overdue payment and deliverable still appear once — correct.
