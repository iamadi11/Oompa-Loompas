# UX: Main nav current location

**Web shell:** [web-shell-pwa.md](./web-shell-pwa.md) (section *Global navigation (accessibility)*)

## User journey

1. Creator lands on overview, **Attention**, or **Deals** (including new deal and deal detail).
2. Header shows which **section** they are in: **Revenue** (home only), **Attention**, or **Deals** — visually and via `aria-current="page"`.

## States

- **Home (`/`):** Brand link is current; Attention and Deals are not.
- **Attention queue:** Attention current.
- **Any `/deals/*` route:** Deals current (list, create, detail).

## Critic feedback

Matches mental model: “I’m in Deals until I explicitly leave.” No extra chrome.

## Accessibility

- `aria-current="page"` on exactly one main nav target per view (brand OR Attention OR Deals for home vs module routes).
- Focus rings unchanged from shell standard.

**Browser MCP check (2026-04-06):** Accessibility tree on dev **3005** showed `states: [current]` on the expected header link for `/`, `/attention`, `/deals`, and filtered `/deals?needsAttention=true` (see [browser-ux-checklist-run-2026-04-06.md](../testing/browser-ux-checklist-run-2026-04-06.md)).
