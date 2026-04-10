# Test Plan: Deal brand suggestions

## Coverage Baseline
Existing deal route tests and web `api` client tests extended for the new path.

## Test Cases
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|------------|
| GET /brands with session | API integration | 200, ordered data, correct `groupBy` args | Medium |
| GET /brands no session | API integration | 401 | Low |
| Empty portfolio | API integration | `{ data: [] }` | Low |
| `listDealBrands` client | Unit | Correct URL and JSON parse | Low |
| `DealBrandSummarySchema` | Unit | Valid / invalid `dealCount` | Low |

## Edge Cases
- User with zero deals.
- Multiple deals sharing one brand (count > 1).

## Failure Mode Tests
- Unauthenticated access rejected (401).

## Coverage Target
≥90% on touched API handlers (via existing thresholds), types package, and `api.ts` client.
