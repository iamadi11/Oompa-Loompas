# Instrumentation: Deal Next-Action Prompt

## Hypothesis
If creators see a one-click status-advance CTA on the deal detail page, deals will move to PAID status faster — reducing the average time a deal spends in DELIVERED status with all payments received.

## Baseline
- Current state: creators must scroll to the edit form at the bottom of the deal detail page to change deal status manually.
- Avg time DELIVERED → PAID: unmeasured (no baseline prior to this feature — first measurement after deploy is the baseline).

## Post-Deploy Signals
| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| Deal status updates to PAID via `PATCH /api/v1/deals/:id` | API access logs | N/A (learning signal) |
| Time between last payment RECEIVED and deal status → PAID | DB query: `deals.updatedAt - payments.max(receivedAt)` where status = PAID | Watch for improvement over 2 iterations |
| Deal DELIVERED count staying flat (deals stuck in DELIVERED) | `SELECT COUNT(*) FROM deals WHERE status = 'DELIVERED'` | Flag if count grows without corresponding PAID conversions |

## Rollout Plan
Immediate full rollout — feature is read-only (computes from existing data), no schema changes, no payment data touched. No feature flag needed.

## Learning Milestone
After 2 weeks: query how many deals moved to PAID via this path vs. manual edit form. If zero transitions via new path → investigate whether the banner is being seen (check if users have deals in valid advance state).
