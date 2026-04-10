# Retro: Deal brand suggestions
Shipped: 2026-04-11

## What Was Built
Session-scoped distinct brand endpoint plus native datalist hints on the deal form, with types and tests.

## Decisions Made (and why)
Chose `groupBy` for counts and `<datalist>` for zero-dependency UX; silent failure keeps offline/degraded API from blocking deal entry.

## What the Critic User Said
“Good enough for speed; hope my browser actually shows the dropdown.”

## Post-Deploy Baseline
Capture API latency and optional distinct-brand ratio query after first week of use.

## What To Watch
Error rate on `/deals/brands`; user feedback on browser-specific datalist behavior.

## What We'd Do Differently
If adoption is high, invest in a proper combobox with normalization (case-folding) before building full CRM profiles.
