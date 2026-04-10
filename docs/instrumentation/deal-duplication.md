# Instrumentation: Deal Duplication

## Hypothesis
If creators can duplicate deals in 2 clicks, repeat campaign setup time drops from ~5 min to <30s,
leading to more deals tracked per creator (measurable via deal count increase within 2 weeks of ship).

## Baseline
- Current deal count per active user: read from DB before deploy
- Current `POST /api/v1/deals` rate: read from API logs before deploy

## Post-Deploy Signals
| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| `POST /api/v1/deals/:id/duplicate` 2xx rate | API logs | Any non-zero = feature discovered |
| `POST /api/v1/deals/:id/duplicate` 4xx/5xx rate | API logs | >5% = investigate |
| Deals created via duplicate vs. new form ratio | DB query: count deals with title LIKE `%(Copy)%` | >10% of new deals = adoption signal |
| New DRAFT deals per user per week | DB query | Upward trend vs. 2-week baseline = friction reduced |

## Rollout Plan
Immediate: no feature flag needed (no revenue path impact, new additive surface).
Watch for 7 days post-ship.
