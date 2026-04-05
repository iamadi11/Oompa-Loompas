# Test plan: Deals list document titles

## Coverage baseline

`DealsPage` RSC remains outside Vitest file coverage (App Router). **Filter + title inputs** are covered via **`lib/deals-page.ts`**.

## Test cases

| Scenario | Type | Expected | Risk |
|----------|------|----------|------|
| `needsAttention=true` | Unit | filter true | Low |
| `needsAttention=1` | Unit | filter true | Low |
| absent / false / garbage | Unit | filter false | Medium |
| `string[]` first value | Unit | deterministic | Medium |

## Edge cases

- **`searchParams` array** (duplicate keys): first value wins — matches typical Next normalization expectations.

## Failure modes

- Wrong title with **valid** filter → adjust **`isDealsNeedsAttentionFilter`** and tests.

## Coverage target

≥90% on **`apps/web/lib/deals-page.ts`** (current: **100%** statements).
