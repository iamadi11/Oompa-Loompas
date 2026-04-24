# Architecture: Payment Reconciliation

## Module

Payment (existing). No new module.

## Data Flow

```
Browser CSV upload
  → client-side parse (plain JS, no library)
  → extract credits (positive amounts + dates)
  → POST /api/v1/reconcile/match { transactions: [{date, amount, description?}] }
    → query pending/partial payments for auth'd user
    → matchTransactionsToPayments() pure function
    → return matches with confidence scores
  → creator reviews table (checkbox + editable receivedAt)
  → POST /api/v1/reconcile/apply { approvals: [{paymentId, receivedAt}] }
    → verify payment ownership (scoped to userId)
    → bulk update status=RECEIVED, receivedAt
    → return { updated: number }
```

## Schema Changes

None. Uses existing `payments.status` and `payments.received_at`.

## API Contract

### POST /api/v1/reconcile/match
Auth required.

Request:
```json
{
  "transactions": [
    { "date": "2026-04-18", "amount": 75000, "description": "UPI/Nike Creative" }
  ]
}
```

Response 200:
```json
{
  "data": {
    "matches": [
      {
        "transactionIndex": 0,
        "paymentId": "pay-uuid",
        "dealId": "deal-uuid",
        "dealTitle": "Nike Q2 Integration",
        "brandName": "Nike",
        "paymentAmount": 75000,
        "transactionAmount": 75000,
        "transactionDate": "2026-04-18",
        "confidence": "high",
        "suggestedReceivedAt": "2026-04-18"
      }
    ],
    "unmatched": [1]
  }
}
```

### POST /api/v1/reconcile/apply
Auth required. Idempotent (applying RECEIVED to already-RECEIVED is a no-op).

Request:
```json
{
  "approvals": [
    { "paymentId": "pay-uuid", "receivedAt": "2026-04-18" }
  ]
}
```

Response 200:
```json
{ "data": { "updated": 1 } }
```

## Matching Algorithm (`matchTransactionsToPayments` in `@oompa/utils`)

Pure function. Deterministic. No external calls.

Input: `BankTransaction[]` + `PendingPaymentRow[]`
Output: `PaymentMatch[]`

Confidence scoring (highest match wins per payment):
- `high`: exact amount AND (brand name substring in description OR date within ±7 days of dueDate)
- `medium`: exact amount only
- `low`: amount within ±5% AND date within ±7 days of dueDate

One transaction → at most one payment match (highest confidence).  
One payment → at most one transaction match (de-duplication: each transaction claimed by best match).

## Tech Choices

| Choice | Reason |
|---|---|
| Client-side CSV parsing | No file upload infra; raw CSV stays in browser |
| Pure matching function in `@oompa/utils` | Testable in isolation; no DB dependency |
| No new schema | `status` + `received_at` already exist |
| Confidence badges | Creator must understand basis for each match; no black-box |

## Security

- `/reconcile/match` and `/reconcile/apply` require `req.authUser.id`
- Match query scoped: `payment.deal.userId = authUser.id`
- Apply verifies each `paymentId` belongs to `authUser.id` before update
- No broadened data access; no new PII fields

## Scale

At 10K creators, each reconcile request hits DB once (bulk query pending payments for user) + in-memory match. No background job needed. <50ms expected at any realistic creator payment volume (<100 pending payments per user).

## Ops

No migrations. No cron. Rollback: the `/reconcile/apply` endpoint writes to existing payment rows — rollback is reverting status back to PENDING via existing `PATCH /api/v1/payments/:id`. No data is deleted.
