# Test plan: Deals “needs attention” empty state

## Coverage baseline

`lib/**/*.ts` Vitest suite; new file `deal-list-empty.ts` covered via `lib/__tests__/deal-list-empty.test.ts`.

## Test cases

| Scenario | Type | Expected | Risk |
|----------|------|----------|------|
| `getDealListEmptyContent('all')` | Unit | Onboarding title + `/deals/new` primary | High |
| `getDealListEmptyContent('needsAttention')` | Unit | Caught-up title + `/deals` primary; copy mentions overdue | High |

## Edge cases

- Typed routes: `primaryHref` / `secondaryHref` use `AppPath` union so `next/link` `href` typechecks.

## Failure modes

- Regression: needs-attention empty shows “No deals yet” → unit test + manual `/deals?needsAttention=true` when DB has no overdue rows.

## Coverage target

≥90% on `lib/deal-list-empty.ts` (met at 100% lines in run).
