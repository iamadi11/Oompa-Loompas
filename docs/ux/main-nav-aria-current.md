# UX: Main nav current location

**Web shell:** [web-shell-pwa.md](./web-shell-pwa.md) (section *Global navigation (accessibility)*)

## User journey

1. Creator lands on overview (`/dashboard`), **Attention**, or **Deals** (including new deal and deal detail).
2. Header shows which **section** they are in: **Revenue** (brand → overview), **Overview**, **Attention**, or **Deals** — visually and via `aria-current="page"`.

## States

- **Overview (`/dashboard`):** Brand and Overview links are current; Attention and Deals are not.
- **Attention queue:** Attention current.
- **Any `/deals/*` route:** Deals current (list, create, detail).

## Critic feedback

Matches mental model: “I’m in Deals until I explicitly leave.” No extra chrome.

## Accessibility

- `aria-current="page"` on the expected targets per view (brand + Overview share overview; Attention or Deals for module routes).
- Focus rings unchanged from shell standard.

**Browser MCP check (2026-04-06):** Historical run on dev **3005** used `/` as overview; after auth uplift, re-validate `aria-current` on `/dashboard`, `/attention`, `/deals`, and filtered `/deals?needsAttention=true` (see [browser-ux-checklist-run-2026-04-06.md](../testing/browser-ux-checklist-run-2026-04-06.md)).
