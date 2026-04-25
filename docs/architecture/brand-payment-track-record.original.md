# Architecture: Brand Payment Track Record

## Module
Deal + Payment Intelligence. Extends existing Brand module (`apps/api/src/routes/brands/`).

## Data Flow
`GET /api/v1/brands/:brandName` → handlers.ts → 3 parallel Prisma queries → aggregate → return extended BrandProfileStats

## Schema Changes
None. Uses existing `payments.received_at`, `payments.due_date`, `payments.status`, `payments.amount`, `deals.currency`.

## API Contract Extension (additive)

New fields on `BrandProfileStats` (packages/types/src/brand.ts):
```
receivedPaymentsCount: number           -- total RECEIVED payments for this brand
avgDaysToPayment: number | null         -- mean(receivedAt - dueDate) in days; null if no payments with both fields
onTimeRate: number | null               -- fraction [0,1] paid receivedAt <= dueDate; null if no qualifying payments
receivedTotals: { currency, amount }[]  -- sum of amounts per currency for RECEIVED payments
```

Backward-compatible: new fields added to existing object. No existing fields removed.

## New Query (3rd parallel alongside existing two)

```typescript
prisma.payment.findMany({
  where: {
    deal: { userId, brandName: { equals: brandName, mode: 'insensitive' } },
    status: 'RECEIVED',
  },
  select: {
    dueDate: true,
    receivedAt: true,
    amount: true,
    deal: { select: { currency: true } },
  },
})
```

Compute from rows:
- `receivedPaymentsCount` = rows.length
- Filter to rows where both dueDate and receivedAt non-null → `qualifyingRows`
- `avgDaysToPayment` = qualifyingRows.length > 0 ? mean((receivedAt - dueDate) / ONE_DAY_MS) : null
- `onTimeRate` = qualifyingRows.length > 0 ? (rows where receivedAt <= dueDate).length / qualifyingRows.length : null
- `receivedTotals` = group by deal.currency, sum amount.toNumber()

## Scale
Single query per brand profile load. Index: `payments.deal_id` (existing) + join to `deals.user_id`. At 10K creators × 50 payments = 500K rows; query is filtered + small (per brand per user). No caching needed.

## Ops
No migration. Additive API change. No rollback risk.
