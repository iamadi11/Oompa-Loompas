# Decision: UX Polish — Shell Accessibility (2026-04-06)
Phase: 1 | Status: SHIPPED

## aria-current on main nav
`MainNav` sets `aria-current="page"` on Revenue (`/`), Attention (`/attention/*`), Deals (`/deals/*`). Visual emphasis (semibold + darker text) mirrors semantic state. Without this, keyboard/SR users can't programmatically determine location — WCAG 2.2 requires it where multiple nav options exist.

**Success:** `/` → Revenue current; `/attention` → Attention current; `/deals`, `/deals/new`, `/deals/[id]` → Deals current.

## Document titles on deals list
`/deals` uses `generateMetadata` to produce `Deals · Revenue`; with `needsAttention=true|1` → `Needs attention · Revenue`. Root layout `title.template` appends `· Revenue` — segment titles must be short labels only. Server metadata stays aligned with first paint (no hydration flash vs `document.title`).

**Success:** Both title variants resolve server-side. Filter flag parsing unit-tested in `lib/deals-page.ts` (covers `string | string[]` searchParams).
