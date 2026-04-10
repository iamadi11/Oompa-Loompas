# Architecture: Deliverables portfolio CSV export

## Module
Deliverable rows via Deal tenancy: `deliverable.findMany({ where: { deal: { userId } } })`.

## Data flow
Session → Prisma query with `deal` select → map to `DeliverablePortfolioCsvRow` → `buildDeliverablesPortfolioCsv` → CSV + BOM.

## Data model changes
None.

## API
- **Route:** `GET /api/v1/deals/export/deliverables` (registered before `/export/payments` and `/export`).
- **Limit:** 10,000 rows.
- **Auth:** Session cookie; 401 if missing.

## Rollback
Remove route and UI control only.
