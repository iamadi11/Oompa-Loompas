# Test Plan: Revenue Dashboard

## Coverage Baseline

Before this work: no dashboard module existed.

## Test Cases (API — `apps/api/src/__tests__/dashboard.test.ts`)

| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| No deals → all zeros | Integration | 200, all values=0, recentDeals=[] | Medium |
| totalContractedValue = sum of deal values | Integration | 200, value=125000 | Critical |
| totalReceivedValue = RECEIVED only | Integration | 200, value=40000 | Critical |
| totalOutstandingValue = contracted - received | Integration | 200, value=85000 | Critical |
| overduePaymentsCount = PENDING past dueDate | Integration | 200, count=1 | Critical |
| overduePaymentsValue = sum of overdue amounts | Integration | 200, value=40000 | High |
| activeDealsCount = ACTIVE status count | Integration | 200, count=1 | Medium |
| totalDealsCount = all deals | Integration | 200, count=2 | Medium |
| recentDeals capped at 5 | Integration | 200, length=5 (from 7 deals) | Medium |
| paymentSummary on each recentDeal | Integration | 200, correct totals per deal | High |
| RECEIVED past dueDate → not overdue | Integration | 200, overdueCount=0 | Critical |
| Future dueDate PENDING → not overdue | Integration | 200, overdueCount=0 | High |
| dominantCurrency = mode of currencies | Integration | 200, currency=INR | Low |

## Edge Cases

- No deals: returns zeros, not an error
- Deal with no payments: paymentSummary shows totalReceived=0, totalOutstanding=dealValue, hasOverdue=false
- RECEIVED payment with past dueDate: NOT counted as overdue (status takes precedence)
- PARTIAL payment: counted in totalReceivedValue (same logic as PaymentSection)

## Failure Mode Tests

- API unreachable at SSR time: web falls back to empty state (not covered by API tests — handled by SSR try/catch)

## Coverage Achieved

- `src/routes/dashboard/handlers.ts`: 100% statements, 93.75% branches, 100% functions
- `src/routes/dashboard/index.ts`: 100%

The uncovered branch (line 43 in handlers.ts) is the `dominant?.[0] ?? 'INR'` fallback — unreachable in practice since the function only runs when `deals.length > 0` (the empty array guard is before this call). Documented as acceptable gap.
