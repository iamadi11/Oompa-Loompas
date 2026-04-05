# Instrumentation: Deals “needs attention” filter

## Hypothesis
Filtered deal list views correlate with faster clearance of overdue rows (fewer days overdue per payment).

## Baseline
Pre-ship: no `needsAttention` param.

## Signals
| Signal | Where |
|--------|--------|
| Share of `GET /deals?needsAttention=true` vs plain `/deals` | API logs / analytics (future) |

## Rollout
Immediate; additive query param.
