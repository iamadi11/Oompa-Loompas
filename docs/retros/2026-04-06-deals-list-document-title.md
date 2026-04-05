# Retro: Deals list document titles

Shipped: 2026-04-06

## What was built

`generateMetadata` on **`app/deals/page.tsx`** plus **`isDealsNeedsAttentionFilter`** in **`lib/deals-page.ts`** with Vitest coverage. Document titles: **`Deals · Revenue`** / **`Needs attention · Revenue`**.

## Decisions

- Reuse root **`title.template`**; segment values stay **one or two words**.
- Centralize query parsing in **`lib`** so filter logic is **tested** without RSC harness.

## Critic user

“I have six tabs; finally the deals tab says **Deals** instead of the whole product name.”

## Post-deploy baseline

Not instrumented (see `docs/instrumentation/deals-list-document-title.md`).

## What to watch

Browser MCP / checklist runs: confirm **document name** in snapshots after future Next upgrades.

## What we’d do differently

If more query-driven titles appear, extract a tiny **`lib/metadata/`** module rather than scattering `searchParams` parsers.
