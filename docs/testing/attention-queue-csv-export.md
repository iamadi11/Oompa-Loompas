# Test Plan: Attention queue CSV export

## Coverage Baseline
Extended `attention.test.ts`, `api.test.ts`, and new `attention-csv.test.ts`.

## Test Cases
| Scenario | Type | Expected |
|----------|------|----------|
| Unauthenticated export | API | 401 |
| Empty queue | API | 200, BOM, header-only |
| Payment + deliverable | API | Both row kinds; brand present |
| Utils builder | Unit | Header, escaping, filename UTC |
| Client `downloadAttentionQueueCsv` | Unit | Correct path, blob |

## Edge Cases
- Deliverable row gets `brand_name` from parent deal map.

## Coverage Target
≥90% on new/changed modules per repo gates.
