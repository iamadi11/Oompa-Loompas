# Architecture: Payment milestones CSV export

## Module
Deal (aggregate read) + Payment rows via Prisma relation filter `deal.userId`.

## Data flow
Session userId → `payment.findMany({ where: { deal: { userId } }, include: deal subset })` → map to `PaymentPortfolioCsvRow` → `buildPaymentsPortfolioCsv` → CSV response.

## Data model changes
None.

## API contract
- **Route:** `GET /api/v1/deals/export/payments` (registered before `/export` and `/:id` not required for collision — two-segment static path).  
- **Auth:** Session; 401 if missing.  
- **Limit:** 10,000 payments.  
- **Response:** `text/csv; charset=utf-8`, UTF-8 BOM, `Content-Disposition: attachment`.  

## Scale
Indexed `dealId` on payments; filter uses deal ownership. Bounded by `take`.

## Rollback
Remove route + UI button; no data migration.
