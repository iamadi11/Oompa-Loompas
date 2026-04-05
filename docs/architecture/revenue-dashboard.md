# Architecture: Revenue Dashboard

**Web shell & PWA:** [web-shell-pwa.md](../ux/web-shell-pwa.md) · [pwa-web-client.md](./pwa-web-client.md)

## Module: Dashboard (cross-cutting read over Deal + Payment)

## Data Flow

```
GET /api/v1/dashboard
  → Handler (apps/api/src/routes/dashboard/handlers.ts)
  → prisma.deal.findMany({ include: { payments: true }, orderBy: { createdAt: 'desc' } })
  → Iterate deals + payments: compute totals, overdue counts, dominant currency
  → computePaymentSummary() per deal for recentDeals
  → Serialize: { totalContractedValue, totalReceivedValue, totalOutstandingValue,
                 overduePaymentsCount, overduePaymentsValue, activeDealsCount,
                 totalDealsCount, dominantCurrency, recentDeals[] }
  → 200 JSON response
```

## Data Model Changes

No new tables. No migrations. Reads from existing `deals` + `payments` tables via Prisma include.

## API Contract

### `GET /api/v1/dashboard`
- Input: none
- Output: `{ data: DashboardSummary }`
- Never 404 — returns zeroes if no deals exist

```typescript
interface DashboardSummary {
  totalContractedValue: number     // sum of all deal.value
  totalReceivedValue: number       // sum of RECEIVED + PARTIAL payments
  totalOutstandingValue: number    // totalContracted - totalReceived
  overduePaymentsCount: number     // count of PENDING payments with past dueDate
  overduePaymentsValue: number     // sum of overdue payment amounts
  activeDealsCount: number         // count of deals with status=ACTIVE
  totalDealsCount: number
  dominantCurrency: Currency       // mode of deal currencies; INR fallback
  recentDeals: DashboardDeal[]     // last 5 deals ordered by createdAt desc
}
```

**Versioning:** Under `/api/v1/`. Breaking changes → `/api/v2/`.

## Currency Handling (Phase 1 Limitation)

All values are summed as raw numbers. `dominantCurrency` is the mode of all deal currencies — used as the display label. Creators with mixed currencies (e.g. 3 INR deals + 1 USD deal) will see INR totals with USD figures silently included. This is documented as a Phase 1 simplification; multi-currency conversion is Phase 4.

## Events

Emits: none
Consumes: none (read-only aggregate)

## Scale Analysis

**Query pattern:** `findMany` with `include: { payments: true }` — Prisma issues 2 queries:
1. `SELECT * FROM deals ORDER BY created_at DESC`
2. `SELECT * FROM payments WHERE deal_id IN (...)`

At 1,000 deals × 10 payments = 10,000 rows — acceptable. At 10,000 deals, add pagination or a DB-side aggregate query (SUM, COUNT at SQL level). Phase 1 creators have O(10–100) deals.

**Caching:** None in Phase 1. Add Redis cache with 30s TTL at Phase 3 if dashboard becomes a hot path.

**Async boundary:** Synchronous per-request. No background jobs.

## Tech Choices

| Choice | Alternatives | Why This |
|--------|-------------|----------|
| Single endpoint `/api/v1/dashboard` | N+1 from web (deals list + N payment fetches) | One DB round-trip; no client-side aggregation |
| Prisma `include: { payments: true }` | Raw SQL aggregate | Consistent with existing pattern; fast enough for Phase 1 scale |
| dominantCurrency = mode | Fixed INR | Honest for mixed-currency setups; trivial to compute |
| SSR for home page | Client-side fetch | Dashboard is meaningful on first paint; SSR is already the pattern |

## Operational Design

**Deploy:** Standard pipeline. No migrations. No infra changes.

**Monitoring:** Track `GET /api/v1/dashboard` P99 latency and error rate. Alert if P99 > 300ms (above the <200ms SLA — investigation needed at scale).

**Rollback:** Revert server.ts import + revert page.tsx to placeholder. 5-minute revert.
