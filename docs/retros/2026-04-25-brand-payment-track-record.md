# Retro: Brand Payment Track Record (v0.5.7)

## What was built
Payment behavior stats on brand profile page: received count, avg days to payment (early/late), on-time rate, total received per currency, and an amber risk warning for chronic late payers. Section hidden until ≥1 received payment exists.

## Decisions + why
- **Pure aggregation, no schema changes** — all stats derivable from existing `payments` table. Avoided migration complexity.
- **Null-safe two-tier filtering** — `receivedTotals` uses ALL received payments; `avgDays`/`onTimeRate` only use qualifying (both `dueDate` and `receivedAt` non-null). Prevents silent bad data from payments that skipped due-date tracking.
- **Risk threshold: >14d avg OR <50% on-time, ≥2 payments** — conservative minimum sample to avoid false signal from a single delayed payment.
- **4-query parallel Promise.all** — recentDeals moved into the batch (simplify review finding), saving one round-trip.
- **Non-null assertions in JSX** — redundant `stats.avgDaysToPayment != null &&` checks removed inside `{avgDaysLabel && (...)}` guards; TS non-null assertion (`!`) used safely since the guard already checks.

## Critic feedback
"I can immediately see if Nike is reliable. I don't have to count manually. But will I remember to check this BEFORE signing? Probably not until I get burned once." → Acceptable; the page is clear after first encounter.

## Post-deploy baseline
- Feature renders only when `receivedPaymentsCount > 0`; zero-state invisible to new users
- Overdue rate per brand is the long-term signal to watch
- No feature flag needed; no existing flow disrupted

## What to watch
- Creators with ≥2 received payments who revisit brand profile after new deal creation
- Whether overdue rate decreases for "risky" brands over 60 days

## What to do differently
- `BrandProfileStats` interface in `apps/web/lib/api.ts` should mirror `packages/types/src/brand.ts` — the duplicate definition caused a typecheck failure that could be avoided if the web app imported the canonical Zod type directly. Consider converting `BrandProfileView` to use `@oompa/types` directly in a future cleanup.
