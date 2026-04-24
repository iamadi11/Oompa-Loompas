# Instrumentation: Payment Reconciliation

## Hypothesis
Creators will use `/reconcile` to mark ≥1 payment RECEIVED per week within 14 days of launch, reducing the average time-to-mark-received from days (manual) to minutes (CSV import).

## Baseline (pre-launch)
- Payments marked RECEIVED via `/api/v1/payments/:id` PATCH (manual one-by-one): tracked in existing logs
- Payments marked RECEIVED via `/api/v1/reconcile/apply`: **0** (new endpoint, never called)
- Average overdue items on `/attention`: unknown — establish during first week

## Post-deploy signals

| Signal | How to measure | Target |
|--------|---------------|--------|
| Reconcile sessions | Count of `POST /api/v1/reconcile/match` calls | ≥1/week per active user after 14 days |
| Payments marked via reconcile | Sum of `updated` in `POST /api/v1/reconcile/apply` responses | Growing week-over-week |
| Match quality | `confidence` distribution in match responses (high/medium/low) | ≥70% high or medium matches |
| Session completion rate | `apply` calls / `match` calls | ≥50% (started → finished) |
| Time-to-apply | Timestamp delta: first `match` → `apply` in same session | Median < 2 minutes |

## Rollout plan
No feature flag needed — new page at `/reconcile`, no existing flow modified. The only entry point is the "Reconcile from bank →" link on `/attention`, visible only when overdue payments exist. Zero risk of disrupting existing flows.

Monitor `POST /api/v1/reconcile/apply` error rate post-deploy. If > 1% errors in first 24h, check DB write permissions and `updateMany` query shape.
