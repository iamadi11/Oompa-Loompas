# Instrumentation: Payment reminder copy

## Hypothesis

If one-tap reminder copy is available, creators **chase overdue payments sooner** (qualitative); downstream **time-to-paid** should improve once measured with real traffic.

## Baseline

No prior signal (feature is new). Baseline **copy success rate** is unknown.

## Post-deploy signals

| Signal | Where | Note |
|--------|--------|------|
| Adoption | Optional: add `reminder_copy_clicked` client event later | Not in v1 to keep scope minimal |
| Support | Fewer “how do I remind them?” requests | Informal |

## Rollout

Immediate; additive UI and JSON field. No feature flag.
