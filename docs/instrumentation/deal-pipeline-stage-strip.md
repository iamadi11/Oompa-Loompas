# Instrumentation: Deal pipeline stage strip

## Hypothesis

If creators can filter deals by pipeline stage in one click, they will navigate to "Delivered" deals more frequently and mark payments received sooner → fewer overdue receivables.

## Baseline

- Current `/deals` page: unfiltered list, no stage-based navigation.
- Overdue payment rate: measured via `overdue_payment` priority actions count in dashboard (existing).

## Post-Deploy Signals

| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| `/deals?status=DELIVERED` page views | Server access logs or analytics | Baseline: 0 (new route parameter) |
| `/deals?status=ACTIVE` page views | Server access logs | Baseline: 0 |
| `overdue_payment` priority action count per user | `GET /api/v1/dashboard` response → `priorityActions` where `kind === 'overdue_payment'` | Watch for downward trend over 2 weeks |
| Payment `RECEIVED` marks per week | `PATCH /api/v1/payments/:id` with `status: RECEIVED` | Watch for upward trend |

## Rollout Plan

Immediate full rollout. No feature flag required:
- Purely additive UI — no revenue path change, no pricing or payment logic
- Zero risk of data loss or incorrect financial state
- Rollback is a single revert commit

## Learning Milestone

Read post-deploy in: **7 days**  
Signal: any non-zero usage of `?status=DELIVERED` or `?status=ACTIVE` filters confirms feature discovery.
