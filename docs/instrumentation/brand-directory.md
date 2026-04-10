# Instrumentation: Brand directory

## Hypothesis
Brand directory views correlate with faster navigation to overdue work for multi-deal brands.

## Baseline
Not tracked in-app; optional `/deals/brands` route analytics later.

## Signals
| Signal | Threshold |
|--------|-----------|
| `GET /deals/brands` 5xx | > 1% sustained |

## Rollout
Immediate.
