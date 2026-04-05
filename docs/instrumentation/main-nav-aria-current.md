# Instrumentation: Main nav `aria-current`

## Hypothesis

Clear programmatic current location in the shell reduces disorientation on core revenue routes (overview → attention → deal detail).

## Baseline

Before: Main nav links had no `aria-current`.

## Post-deploy signals

| Signal | Where | Notes |
|--------|--------|--------|
| A11y audits | Lighthouse / axe on `/`, `/attention`, `/deals` | No regression on nav contrast/focus |
| Qualitative | Creator feedback | “Always knew which section I was in” (optional interview) |

No new server metrics; shell-only change.

## Rollout

Immediate with web deploy.
