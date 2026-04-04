# Test Plan: Payment Tracking

## Coverage Baseline

Before this work: 0 payment tests (no payment module existed).

## Test Cases (API — `apps/api/src/__tests__/payments.test.ts`)

| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| List payments for existing deal | Integration | 200 + array | Medium |
| List payments for non-existent deal | Integration | 404 | High |
| Create payment (minimal fields) | Integration | 201 + isOverdue=false | High |
| Create payment with past dueDate | Integration | 201 + isOverdue=true | High |
| Create payment for RECEIVED status | Integration | 201 + isOverdue=false even if past due | High |
| Create payment amount=0 | Integration | 400 validation error | High |
| Create payment negative amount | Integration | 400 validation error | Medium |
| Create payment for non-existent deal | Integration | 404 | High |
| Update payment status to RECEIVED | Integration | 200 + isOverdue=false | High |
| Update payment clear dueDate to null | Integration | 200 + dueDate=null | Medium |
| Update payment set past dueDate | Integration | 200 + isOverdue=true | High |
| Update non-existent payment | Integration | 404 | Medium |
| Delete payment | Integration | 204 | Medium |
| Delete non-existent payment | Integration | 404 | Medium |
| isOverdue=false for RECEIVED past due | Integration | 200 + isOverdue=false | Critical |
| isOverdue=true for PARTIAL past due | Integration | 201 + isOverdue=true | High |
| isOverdue=false when no dueDate | Integration | 201 + isOverdue=false | High |
| PATCH with amount, receivedAt | Integration | 200 + updated fields | Medium |

## Edge Cases

- `isOverdue` never true for RECEIVED or REFUNDED status, even if dueDate is in the past
- Amount=0 rejected at validation; negative amount rejected
- `dueDate` and `receivedAt` can be explicitly set to null via PATCH (clearing them)
- Payments are cascade-deleted when the parent Deal is deleted (enforced at DB level)
- Currency defaults to deal's currency (set by caller in CreatePayment)

## Failure Mode Tests

- Deal not found on create: handler checks deal existence before creating payment
- Payment not found on update/delete: handler returns 404 with descriptive message
- Invalid datetime format: Zod rejects non-ISO 8601 strings for dueDate/receivedAt

## Coverage Target

| File | Statements | Branches | Functions |
|------|-----------|---------|----------|
| `src/routes/payments/handlers.ts` | ≥90% | ≥80% | 100% |
| `src/routes/payments/index.ts` | 100% | 100% | 100% |

**Achieved:** 98.23% statements, 92.3% branches, 100% functions on payments module.
