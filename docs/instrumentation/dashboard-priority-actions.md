# Instrumentation: Dashboard priority actions

## Hypothesis
If overdue work is visible on first paint, creators open deal detail for overdue items more often and reduce time-to-follow-up on payments.

## Baseline
Pre-ship: no `priorityActions` field; no structured signal for “action list rendered.”

## Post-deploy signals
| Signal | Where to read | Alert threshold |
|--------|----------------|-----------------|
| `priorityActions` length distribution | API logs/metrics (if added) or sampled analytics event `dashboard_priority_actions_count` | None until pipeline exists |
| Deal detail views following home | Product analytics (future) | TBD |

## Rollout plan
Immediate release: additive API field + UI section. No feature flag required (read-only aggregation). If support noise arises, hide UI via env flag in a follow-up (not implemented in this slice).
