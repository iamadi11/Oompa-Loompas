# Instrumentation: Attention queue

## Hypothesis
If overflow is visible, more creators clear backlogs because they trust the queue is complete.

## Baseline
Pre-ship: no `/attention` route; no total count on dashboard.

## Post-deploy signals
| Signal | Where | Notes |
|--------|--------|------|
| GET /api/v1/attention volume | API logs / gateway | Compare to dashboard hits |
| Nav vs overflow link usage | Product analytics (future) | Optional |

## Rollout
Immediate; additive API and UI.
