# Instrumentation: Deal brand suggestions

## Hypothesis
If creators see prior brand strings when creating deals, duplicate brand spellings in the portfolio decrease within 30 days of ship.

## Baseline
Not instrumented in-app pre-0.4.4; optional post-hoc DB query on distinct `brand_name` counts per user over time.

## Post-Deploy Signals
| Signal | Where to Read | Alert Threshold |
|--------|---------------|-----------------|
| `GET /api/v1/deals/brands` 5xx rate | API logs / APM | Sustained > 1% |
| p95 latency | APM | Regressions vs deals list baseline |

## Rollout Plan
Immediate full rollout — read-only, no financial mutation, easy revert.
