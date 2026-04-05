# Instrumentation: Deals “needs attention” empty state

## Hypothesis

If the empty filter state reads as **success** (“caught up”) instead of **failure** (“no deals”), creators will trust the attention and deals flows more and bounce less from `/deals?needsAttention=true`.

## Baseline

Before: zero-row filter reused global empty state (“No deals yet”).

## Post-deploy signals

| Signal | Where to read | Notes |
|--------|----------------|-------|
| Filtered list loads | `GET /api/v1/deals?needsAttention=true` 200 + `data: []` | Sanity: API unchanged |
| Qualitative | Support / user interviews | Ask: “When nothing needs attention, is the message clear?” |

No new server events required; this is copy and navigation clarity.

## Rollout plan

Immediate; rollback is a web-only revert.
