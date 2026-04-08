# UX: Deal pipeline stage strip

## User Journey

1. Creator opens `/deals` → sees Pipeline strip with counts per stage
2. Reads counts at a glance ("2 Active, 1 Delivered, 0 Paid")
3. Clicks "Delivered" tab → page reloads with only delivered deals visible
4. "Active" tab is highlighted; other tabs show their counts in muted style
5. Clicks "All" → returns to unfiltered view

## States

- **Zero state (first use, no deals):** Strip renders with all-zero counts. "All 0" is active. Empty state below ("No deals yet") is unchanged.
- **Loading state:** Next.js RSC streaming. Loading indicator shows until server component resolves. No optimistic UI needed (server-side filter, no client action).
- **Success state:** Strip visible with live counts. Active tab dark-highlighted. List filtered below.
- **Error state:** API load failure shows inline warning banner (existing behavior). Strip does not render when `loadError` is set and `allDeals` is empty.
- **Needs attention mode:** Strip hidden; "Needs attention" pill is active. Existing behavior unchanged.

## Critic Feedback

- **What they'll say first time:** "Oh, I can see how many deals are in each stage — and clicking Active shows me exactly those." Clear enough.
- **Potential confusion:** "Delivered 0" when there are deals — creator might not know they need to update status. This is an existing status-update UX problem, not introduced by the strip.
- **What could make them churn:** Nothing new — the strip is read-only and informational. Worst case: they ignore it.
- **What makes them tell another creator:** "The pipeline tab shows me which deals need payment chasing in one click."
- **Hardest to get right:** Keeping the tab row from looking cluttered at narrow viewports. Solution: flex-wrap so Cancelled drops to a second line on mobile.

## Accessibility

- Keyboard navigation: ✓ — all tabs are `<Link>` elements, fully keyboard-navigable via Tab/Enter
- `aria-label="Filter deals by pipeline stage"` on `<nav>` ✓
- `aria-current="page"` on active tab ✓
- WCAG 2.2 AA: ✓ — color + text label (not color alone) for status identification; focus ring visible
- Focus indicators: present (inherited from global focus-visible ring styles)
- Status dots are `aria-hidden="true"` (decorative) ✓
