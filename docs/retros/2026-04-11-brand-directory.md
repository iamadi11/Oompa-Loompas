# Retro: Brand directory
Shipped: 2026-04-11

## What Was Built
Per-currency brand aggregates API, `/deals/brands` page, deal list `brandName` query wiring, pipeline strip query preservation.

## Decisions
Merged `groupBy` rows in the handler to avoid a second table and to keep JSON one-row-per-brand for the UI and datalist.

## Critic
“Wish I could click into a brand profile” — deferred to richer CRM.

## Watch
None specific beyond API health.
