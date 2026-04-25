# Retro: Brand Payment Track Record (v0.5.7)

## What was built
Payment behavior stats on brand profile: received count, avg days to pay (early/late), on-time rate, total received per currency, amber risk warning for chronic late payers. Hidden until ≥1 received payment.

## Decisions + why
- **Pure aggregation, no schema changes** — all stats from existing `payments` table. No migration.
- **Null-safe two-tier filtering** — `receivedTotals` uses ALL received; `avgDays`/`onTimeRate` only qualifying (both `dueDate` + `receivedAt` non-null). Prevents silent bad data from payments missing due-date.
- **Risk threshold: >14d avg OR <50% on-time, ≥2 payments** — conservative min sample; avoids false signal from single late payment.
- **4-query parallel Promise.all** — recentDeals batched (simplify finding), saves one round-trip.
- **Non-null assertions in JSX** — redundant `stats.avgDaysToPayment != null &&` checks removed inside `{avgDaysLabel && (...)}` guards; `!` safe since guard already checks.

## Critic feedback
"Can immediately see if Nike reliable. No manual counting. But will I check BEFORE signing? Probably not until burned once." → Acceptable; clear after first encounter.

## Post-deploy baseline
- Renders only when `receivedPaymentsCount > 0`; zero-state invisible to new users
- Overdue rate per brand = long-term signal to watch
- No feature flag; no existing flow disrupted

## What to watch
- Creators with ≥2 received payments revisiting brand profile after new deal
- Whether overdue rate drops for "risky" brands over 60 days

## What to do differently
- `BrandProfileStats` interface in `apps/web/lib/api.ts` should mirror `packages/types/src/brand.ts` — duplicate definition caused typecheck failure. Consider importing canonical Zod type directly from `@oompa/types` in future cleanup.