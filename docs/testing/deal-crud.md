# Test Plan: Deal CRUD

**Web shell & PWA:** [web-shell-pwa.md](../ux/web-shell-pwa.md) · [pwa-web-client.md](../architecture/pwa-web-client.md) · [pwa-web-client testing](./pwa-web-client.md)

## Coverage Baseline
Before this work: 0 files, 0 tests (codebase did not exist).

## Test Results

### packages/utils
| Suite        | Tests | Coverage |
|-------------|-------|----------|
| currency.ts  | 18    | 100% stmt, 80% branch |
| date.ts      | 21    | 100% stmt, 92.3% branch |
| validation.ts| 15    | 100% all |
| **Total**   | **54**| **100% stmt, 92.5% branch** |

### apps/api
| Suite        | Tests | Coverage |
|-------------|-------|----------|
| deals.test.ts| 19    | 95.39% stmt, 85.96% branch |
| **Total**   | **19**| **≥ all thresholds** |

**Total: 73 tests, all passing, deterministic.**

## Test Cases

### Utils — Currency
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| Format INR amount | Unit | Includes ₹ and commas | Low |
| Format USD | Unit | Includes $ | Low |
| Format zero | Unit | Includes 0 | Low |
| Format negative (refund) | Unit | Formats correctly | Medium |
| Format fractional | Unit | 2 decimal places | Medium |
| Parse formatted string | Unit | Returns number | Low |
| Parse empty string | Unit | Returns NaN | Medium |
| Currency symbol lookup | Unit | Returns correct symbol | Low |

### Utils — Date
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| Format valid ISO date | Unit | Month + year readable | Low |
| Format invalid date | Unit | Returns "Invalid date" | High |
| Days between positive | Unit | Positive integer | Low |
| Days between negative | Unit | Negative integer | Low |
| Days between same date | Unit | 0 | Medium |
| isOverdue past date | Unit | true | High |
| isOverdue future date | Unit | false | High |
| relativeTime minutes | Unit | "minute" in result | Low |
| relativeTime hours | Unit | "hour" in result | Low |
| relativeTime days | Unit | "days" in result | Low |
| relativeTime months | Unit | "month" in result | Low |
| relativeTime years | Unit | "year" in result | Low |
| toISOString null | Unit | null | High |
| toISOString invalid | Unit | null | High |

### Utils — Validation
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| Valid schema parse | Unit | success + data | Low |
| Invalid schema parse | Unit | failure + errors | High |
| Missing required fields | Unit | failure with paths | High |
| Wrong type | Unit | failure | High |
| Error path + message in failure | Unit | structured output | Medium |
| formatZodErrors flat map | Unit | Record<string,string> | Low |
| isNonEmpty truthy | Unit | true | Low |
| isNonEmpty empty/null | Unit | false | High |
| sanitizeString trim + collapse | Unit | clean string | Low |

### API — Deals
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| GET /deals returns 200 + list | Integration | 200 + data array | Low |
| GET /deals filters by status | Integration | 200 | Low |
| GET /deals invalid status filter | Integration | 400 | High |
| GET /deals/:id found | Integration | 200 + deal data | Low |
| GET /deals/:id not found | Integration | 404 + error | High |
| POST /deals success | Integration | 201 + deal | Low |
| POST /deals missing title | Integration | 400 | High |
| POST /deals missing brandName | Integration | 400 | High |
| POST /deals missing value | Integration | 400 | High |
| POST /deals negative value | Integration | 400 | High |
| PATCH /deals/:id success | Integration | 200 | Low |
| PATCH /deals/:id not found | Integration | 404 | High |
| PATCH /deals/:id invalid transition | Integration | 409 | High |
| PATCH /deals/:id valid transition | Integration | 200 | Medium |
| PATCH /deals/:id clear dates | Integration | 200 | Medium |
| PATCH /deals/:id set dates | Integration | 200 | Medium |
| DELETE /deals/:id success | Integration | 204 | Medium |
| DELETE /deals/:id not found | Integration | 404 | High |
| GET /health | Integration | 200 + ok | Low |

## Edge Cases
- Value = 0: rejected (must be positive) — tested via negative value
- Title = empty string: rejected — tested
- Status = terminal (PAID) trying to transition: returns 409 — tested
- startDate/endDate = null (clearing dates): tested
- Deal not found on any operation: returns 404 — tested for GET, PATCH, DELETE

## Failure Mode Tests
- DB unavailable: mocked via vi.fn().mockRejectedValue() — not tested in Phase 1 (added in Phase 2 with retry tests)
- Concurrent writes: not tested in Phase 1 (Prisma handles at DB level)

## Coverage Target
≥90% on all changed code — achieved across all packages.
