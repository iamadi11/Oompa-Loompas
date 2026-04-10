# Architecture: Deals portfolio CSV export

## Module
Deal (read-only aggregate export; no Payment/Deliverable module writes).

## Data flow
Input (session user id) → Validate auth → Normalize rows via `serializeDeal` → Process `buildDealsPortfolioCsv` → Output `text/csv` + `Content-Disposition: attachment`.

## Data model changes
None.

## API contract
- **Route:** `GET /api/v1/deals/export`  
- **Auth:** Session cookie; 401 if missing  
- **Response:** `200`, `Content-Type: text/csv; charset=utf-8`, body prefixed with UTF-8 BOM (`U+FEFF`)  
- **Ordering:** `createdAt` descending  
- **Limit:** 5000 deals per request (hard cap)  
- **Filename:** `oompa-deals-portfolio-YYYY-MM-DD.csv` (UTC date)  

## Events
None (synchronous download).

## Scale analysis
Single `findMany` by `userId` with index on `user_id`; bounded by `take: 5000`. No caching — export must reflect current DB truth.

## Tech choices
| Choice | Alternatives | Why this |
|--------|----------------|----------|
| CSV in `@oompa/utils` | Inline string concat in handler | Testable, reusable, no duplication |
| Route `/export` before `/:id` | Param `format=csv` on list | Avoids `id = "export"` collision |
| Client blob download | Plain `<a href>` | Surfaces API errors in UI; works with same-origin proxy |

## Operational design
Standard API deploy. Monitor 4xx/5xx rate on `GET /api/v1/deals/export` and latency p95; rollback = revert route + UI control.
