# Instrumentation: Home overview unavailable state

## Hypothesis
If users see an honest unavailable state instead of a false empty state, support confusion (“where did my deals go?”) drops and retry recovery increases.

## Baseline
Pre-ship: unavailable and empty were visually conflated; no structured signal.

## Post-deploy signals
| Signal | Where to read | Alert threshold |
|--------|----------------|-----------------|
| Optional product event `home_overview_unavailable_rendered` | Analytics pipeline (when adopted) | TBD |
| HTTP 5xx / timeout rate on `GET /api/v1/dashboard` | API observability | Existing SLOs |

## Rollout plan
Immediate release: presentation-layer change only. No feature flag (failure mode is strictly clearer than before).

## Learning milestone
Before named events exist, validate via creator interviews or support tags: “thought data was lost on home” should decrease.
