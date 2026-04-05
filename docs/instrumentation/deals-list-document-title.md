# Instrumentation: Deals list document titles

## Hypothesis

Clearer **document titles** slightly reduce **wrong-tab / wrong-context** errors when juggling deals vs attention queue. Effect is **small and hard to isolate** without product analytics.

## Baseline

Not measured (no client analytics in this slice).

## Post-deploy signals

| Signal | Where | Threshold |
|--------|-------|-----------|
| None required | — | **Learning milestone:** ship is **accessibility + shell quality**; revisit if analytics are added. |

## Rollout

**Immediate** — metadata only; rollback via standard deploy revert.
