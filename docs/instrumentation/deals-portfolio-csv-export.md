# Instrumentation: Deals portfolio CSV export

## Hypothesis
If creators can export their portfolio in one click, support requests and manual copy-paste friction drop; we should see non-zero `GET /api/v1/deals/export` 2xx traffic within 14 days of ship.

## Baseline
- Zero prior traffic to this route (new).  
- Optional: spreadsheet of pre-ship “how do I get my data out?” support volume if tracked.  

## Post-deploy signals
| Signal | Where to read | Alert threshold |
|--------|----------------|-----------------|
| `GET /api/v1/deals/export` 2xx count | API logs / metrics | N/A — adoption signal |
| 5xx rate on same route | API logs | >1% over 24h → investigate |
| p95 latency | API metrics | >5s with <100 deals → investigate query/export path |

## Rollout plan
Immediate full rollout — read-only, session-scoped, no financial mutation.  
