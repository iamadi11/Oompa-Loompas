# Architecture: Deal brand suggestions

## Module: Deal (Intelligence-adjacent read)

## Data Flow
Input (session) → Validate auth → Normalize (none) → Process (`prisma.deal.groupBy` by brand + currency, merge) → Output JSON `{ data: DealBrandSummary[] }`

## Data Model Changes
None. Uses existing `deals.brand_name` and `deals.user_id`.

## API Contract
- **Method/path:** `GET /api/v1/deals/brands`
- **Auth:** Session cookie; 401 if missing.
- **Response:** `{ data: DealBrandSummary[] }` — one row per brand, `contractedTotals` per currency, sorted by `brandName` ascending.
- **Versioning:** additive under `/api/v1/deals/*`; route registered before `/:id` to avoid param capture.

## Events
Emits: none. Consumes: none.

## Scale Analysis
One indexed `groupBy` per form mount per user. Bottleneck: DB if portfolios grow huge; mitigation later: cache or materialized view (not Phase 1).

## Tech Choices
| Choice | Alternatives | Why This |
|--------|--------------|----------|
| Prisma `groupBy` | Raw SQL / distinct `findMany` | Typed, matches schema, minimal code |
| `<datalist>` | Combobox component library | Native, accessible baseline, no new deps |

## Operational Design
Standard API deploy; no migrations. Rollback: remove route and UI; no data impact. Monitor 5xx/latency on `GET .../brands` if needed.
