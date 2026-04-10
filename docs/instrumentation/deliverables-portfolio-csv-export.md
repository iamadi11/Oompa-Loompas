# Instrumentation: Deliverables portfolio CSV export

## Hypothesis
Users who export payments will also export deliverables when packaging work for a CA or producer.

## Baseline
New route; zero prior traffic.

## Signals
| Signal | Where | Threshold |
|--------|--------|-----------|
| `GET .../export/deliverables` 2xx | Logs | Adoption |
| 5xx rate | Logs | >1% / 24h |

## Rollout
Immediate; read-only.
