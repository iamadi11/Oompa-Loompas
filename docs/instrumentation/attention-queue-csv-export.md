# Instrumentation: Attention queue CSV export

## Hypothesis
If creators can export the attention queue, more follow-ups complete within 7 days (proxy: repeat visits to deals after export — measure later if product analytics exist).

## Baseline
Not tracked in-app at ship; optional log sampling of `GET /attention/export` count.

## Post-Deploy Signals
| Signal | Where to Read | Alert Threshold |
|--------|---------------|------------------|
| 5xx on export | API logs / APM | Sustained > 1% vs GET /attention |

## Rollout Plan
Immediate; read-only export, same auth as attention page.
