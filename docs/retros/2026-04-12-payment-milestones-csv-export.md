# Retro: Payment milestones CSV export
Shipped: 2026-04-12

## What was built
Payment portfolio CSV endpoint, utils builder, second export button, `fetchBinary` dedupe on web API client.

## Decisions
Nested route `/export/payments` under deals prefix keeps all CSV exports discoverable beside `/export`. Cap 10k payments vs 5k deals reflects more rows per user in worst case.

## Critic user
Must not confuse “Export CSV” (deals) with payments; explicit button copy.

## What to watch
Users hitting 10k cap; request for deliverable export parity.
