# Instrumentation: Payment milestones CSV export

## Hypothesis
Users who export deals will also export payments within the same session when milestones matter for CA work.

## Baseline
New route; zero prior traffic.

## Signals
| Signal | Where | Threshold |
|--------|--------|-----------|
| `GET .../export/payments` 2xx | Logs | Adoption |
| 5xx rate | Logs | >1% / 24h |

## Rollout
Immediate; read-only.
