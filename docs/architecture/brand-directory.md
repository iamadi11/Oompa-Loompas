# Architecture: Brand directory

## Module: Deal (read); Intelligence presentation

## Data Flow
Session → `GET /deals/brands` → Prisma `groupBy` `[brandName, currency]` with `_count`, `_sum(value)` → merge by brand → JSON. Web server page fetches same endpoint; deal list passes `brandName` query to `GET /deals`.

## Data Model Changes
None.

## API Contract
- **`GET /api/v1/deals/brands`:** `{ data: DealBrandSummary[] }` with `contractedTotals: { currency, amount }[]` per brand.
- **Deal list:** `?brandName=` (optional) — existing case-insensitive contains filter.

## Events
None.

## Scale Analysis
One extra dimension in `groupBy` vs count-only; same tenant scope as list deals.

## Operational Design
Deploy with API + web together; rollback removes page and reverts handler (clients expecting old shape must update — monorepo consumers only).
