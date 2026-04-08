# Test Plan: Deal pipeline stage strip

## Coverage Baseline

Pre-existing: `isDealsNeedsAttentionFilter` — 4 tests (all passing).

## Test Cases

| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| `getDealStatusFilter` — absent param | Unit | `null` | Low |
| `getDealStatusFilter` — all 6 valid statuses | Unit | Matching `DealStatus` | Low |
| `getDealStatusFilter` — invalid/unknown string | Unit | `null` | Medium — URL injection |
| `getDealStatusFilter` — array param (Next.js multi-value) | Unit | First valid value or null | Low |
| `computeStatusCounts` — empty array | Unit | All-zero record | Low |
| `computeStatusCounts` — mixed statuses | Unit | Correct per-status counts | Low |

## Edge Cases

- Whitespace/empty string status param → `null` (Zod safeParse rejects)
- Lowercase status (`active`) → `null` (enum is uppercase only)
- Array param with invalid first value → `null`, even if later values are valid
- All deals in one status → other statuses show `0` correctly
- `computeStatusCounts` with 100 deals of same status → correct count

## Failure Mode Tests

All covered by unit tests above. No external dependencies (pure functions).

## Coverage Target

≥90% on: `apps/web/lib/deals-page.ts`

**Achieved:** 100% statement, 100% branch, 100% function on `deals-page.ts` (verified via `pnpm --filter @oompa/web run test` coverage report).
