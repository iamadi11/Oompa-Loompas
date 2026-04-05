# Test plan: Home overview unavailable state

## Coverage baseline
New logic in `apps/web/lib/home-page.ts`; no prior dedicated tests for home branching.

## Test cases
| Scenario | Type | Expected | Risk level |
|----------|------|----------|------------|
| `null` / `undefined` data | Unit | `kind: 'unavailable'` | High |
| `totalDealsCount === 0` | Unit | `kind: 'empty'` | Medium |
| `totalDealsCount > 0` | Unit | `kind: 'ready'` with same object ref | Medium |

## Edge cases
- Undefined vs null both map to unavailable (defensive).

## Failure mode tests
- Fetch failure is modeled as `null` at the page boundary; integration/E2E optional when API harness exists.

## Coverage target
≥90% on `apps/web/lib/home-page.ts` (met via Vitest + existing web coverage gate).
