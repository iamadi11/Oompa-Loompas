# UX: Web shell, PWA, and visual language

**Authority:** SOURCE_OF_TRUTH.md §7 (especially §7.1, §7.4, §7.6, §7.8)

## Purpose

Define how the **global shell** (navigation, chrome, typography, motion) and **PWA behaviors** (install, offline) feel intentional, minimal, and **human-crafted** — not generic “AI product” or template UI.

## Inputs / outputs

| Input | Output |
|-------|--------|
| User on supported browser | Clear install path without trapping focus or hiding core tasks |
| User offline | Deterministic message: connection required for revenue data and actions |
| User with `prefers-reduced-motion` | Essential UI unchanged; non-essential transitions suppressed |

## Visual language (prefer / avoid)

**Prefer**

- Restrained palette, strong type hierarchy, generous whitespace
- One distinctive **display** and one **body** face (via `next/font`) — purposeful, not decorative
- Motion only for **feedback** (hover/focus, submit states) — typically 150–200ms, easing that feels calm

**Avoid**

- Purple gradients on white, generic “dashboard” cards, stock illustration overload
- Ornamental animation (floating blobs, endless loops) that distract from “what should I do next?”
- Inter-only or system-default stacks **without** a deliberate typographic system (see implementation in `apps/web`)

## PWA / install

- Do not block primary tasks behind install prompts
- Preserve **visible focus** and **keyboard** order in the shell after install
- Treat installed mode the same as browser tab for **content truth** — still network-backed for money paths

## Offline

- Copy must state that **deals, payments, and related actions need a connection**
- No implication that cached screens reflect current balances or commitments

## Edge cases

- **Small viewports:** shell remains one column; nav does not rely on hover-only affordances
- **High contrast / forced colors:** focus rings and borders remain visible (align with §7.6)

## Failure modes

- If manifest or SW fails: site degrades to standard web; no broken layout
- If font fails to load: fall back to system stack without layout collapse

## Global navigation (accessibility)

- **Main** nav (`aria-label="Main"`): **Overview**, **Attention**, and **Deals** use `aria-current="page"` when the route matches; active item uses stronger text weight and `text-stone-900` vs `text-stone-600` for inactive links.
- **Revenue** (brand link to `/dashboard`): no `aria-current` — only **Overview** marks the workspace home so a single nav item carries `current` (WCAG-friendly).
- **Deals** is considered current for `/deals`, `/deals/new`, and `/deals/[id]` so orientation persists inside the deal module.

Decision record: [docs/decisions/2026-04-06-main-nav-aria-current.md](../decisions/2026-04-06-main-nav-aria-current.md).

## Related

- [docs/architecture/pwa-web-client.md](../architecture/pwa-web-client.md)
- [docs/testing/pwa-web-client.md](../testing/pwa-web-client.md)
