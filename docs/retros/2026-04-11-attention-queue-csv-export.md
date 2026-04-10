# Retro: Attention queue CSV export
Shipped: 2026-04-11

## What Was Built
Attention queue CSV endpoint, utils builder, web export button, tests, and release docs.

## Decisions Made (and why)
Reused `collectPriorityActionsFromDeals` and enriched deliverable rows with deal brand in the handler only (no JSON contract change). Registered `/attention/export` before `/attention` for clarity.

## What the Critic User Said
“Finally I can paste this into my tracker without retyping.”

## Post-Deploy Baseline
Compare export 4xx/5xx to JSON attention endpoint if metrics available.

## What To Watch
Users hitting 5k cap — revisit if reported.

## What We'd Do Differently
If queues grow, stream CSV or paginate export in a future phase.
