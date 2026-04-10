# Test plan: Deals portfolio CSV export

## Coverage baseline
Existing `deals.test.ts` and `api.test.ts` patterns for auth and Prisma mocks.

## Test cases
| Scenario | Type | Expected | Risk |
|----------|------|----------|------|
| CSV builder escapes comma/quote/newline | Unit (`@oompa/utils`) | Quoted fields per RFC 4180 | Medium |
| CSV builder empty deals | Unit | Header only | Low |
| GET export 200 + BOM + headers | API integration | `findMany` scoped to user, `take: 5000` | High |
| GET export 401 | API | No DB read required for auth failure | Medium |
| `downloadDealsPortfolioCsv` success | Web unit | Correct URL, blob text | Medium |
| `downloadDealsPortfolioCsv` JSON error / 502 | Web unit | User-facing messages | Medium |

## Edge cases
- Notes field with embedded newlines → quoted cell.  
- Large numeric `value` → two decimal places in CSV.  

## Failure modes
- API down → web client shows reachability message (reuses existing 5xx heuristic).  

## Coverage target
≥90% on touched packages (`@oompa/utils` new module, `api.ts`, `handlers.ts` export path).  
