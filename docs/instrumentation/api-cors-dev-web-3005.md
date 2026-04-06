# Instrumentation: API CORS dev origins (port 3005)

## Hypothesis
If local **View invoice** and API calls from **`dev:clean` (3005)** succeed without CORS errors, developers validate payment flows faster and ship fewer env misconfiguration regressions.

## Baseline
Prior state: only **3000** localhost origins in the dev allowlist; **3005** could fail depending on **`WEB_URL`** and hostname choice.

## Post-deploy signals
| Signal | Where to read | Alert threshold |
|--------|----------------|-----------------|
| N/A (dev-only header policy) | — | — |

**Production:** No new metrics. Continue to monitor API **5xx** and latency on existing dashboards; CORS rejections in prod should be **zero** for the single configured **`WEB_URL`**.

## Rollout plan
Ship with normal CI; no feature flag. Revert is a single code rollback.
