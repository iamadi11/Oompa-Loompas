# Instrumentation: Release 0.1.6

## Hypothesis
Clearer error semantics on home reduce mistaken “my deals disappeared” reports; no material change to conversion or payment completion in this patch.

## Baseline
Pre-0.1.6: unavailable and empty states were distinct in logic (0.1.5) but error copy lacked a dedicated accessible region (fixed in 0.1.6).

## Post-deploy signals
| Signal | Where to read | Alert threshold |
|--------|----------------|-----------------|
| `GET /api/v1/dashboard` **5xx / timeout** rate | API / edge logs | Existing SLOs |
| Support tags / qualitative “lost my deals” | Support tooling | Spike after deploy → investigate API, not UI copy |

## Rollout
Standard web deploy; no feature flag (strict improvement to honesty and a11y).
