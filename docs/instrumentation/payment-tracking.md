# Instrumentation: Payment Tracking

## Hypothesis

If creators can record payment milestones against deals, they will use this to track received vs outstanding amounts, leading to fewer missed payments and faster follow-up on overdue amounts. Expected: >60% of deals created will have at least one payment milestone within 7 days of deal creation.

## Baseline

Before this feature: 0 payment records. Creators tracked payments in spreadsheets or mental accounting.

## Post-Deploy Signals

| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| Payment creation rate | `POST /api/v1/deals/:dealId/payments` request logs | Drop to 0 for >24h |
| Payment validation error rate | 400 responses on payments POST | >10% of attempts |
| "Mark received" usage | `PATCH /api/v1/payments/:id` with `status=RECEIVED` | Confirms feature utility |
| Overdue detection accuracy | Manual QA: verify `isOverdue=true` for past-due pending payments | Any false negative = bug |
| API error rate | 5xx responses on payment routes | >0.1% |

## Success Criteria (7-day post-deploy)

- >50% of active deals have at least one payment milestone
- <1% API error rate on payment endpoints
- Zero reports of incorrect `isOverdue` classification

## Rollout Plan

Immediate full rollout. Feature is additive (new UI section, new API routes). No existing functionality modified. No feature flag needed. Rollback: revert the PaymentSection import in the deal detail page + remove payment routes from server.ts (5-minute revert).
