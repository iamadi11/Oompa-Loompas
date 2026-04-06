# Instrumentation: GET /api/v1/health

## Hypothesis
If probes use **`/api/v1/health`**, deploy rollouts see fewer false negatives from path-based routing and faster mean time to detect real API process death.

## Baseline
Pre-ship: only **`GET /health`** at repo root.

## Post-deploy signals
| Signal | Where to read | Alert threshold |
|--------|----------------|-----------------|
| Synthetic `GET /api/v1/health` non-200 | Uptime / k8s probe | Any failure |
| Latency p99 | APM | Spike vs baseline |

## Rollout plan
Immediate; additive route. No feature flag.
