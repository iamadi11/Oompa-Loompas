# Retro: Main nav `aria-current`

Shipped: 2026-04-06

## What was built

Client `MainNav` + `BrandHomeLink` in the root layout, driven by `isMainNavCurrent()` in `lib/main-nav.ts` with full Vitest coverage.

## Decisions

- **Deals** counts as current for any `/deals` prefix (list, new, detail) so creators stay oriented inside the deal module.
- **Revenue** is current only on `/` (overview / empty state), not on every page.

## Critic user

“I tap Deals, I’m in deal world until I go home or Attention — that matches my mental model.”

## What to watch

Automated browser snapshots: some tools surface `aria-current` as `states: [current]` on links; use that in future MCP checklists.

## What we’d do differently

If the app gains more top-level sections, extract nav config (href + match predicate) from a single array to avoid drift.
