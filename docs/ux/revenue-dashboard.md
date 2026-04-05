# UX: Revenue Dashboard

**Web shell & PWA:** [web-shell-pwa.md](./web-shell-pwa.md) · [pwa-web-client.md](../architecture/pwa-web-client.md)

## User Journey

1. Creator opens the app (home page `/`)
2. If no deals: sees the empty state with "Add your first deal" CTA
3. If deals exist: immediately sees 4 summary cards — Contracted / Received / Outstanding / Overdue (or Active deals if no overdue)
4. Red highlight on Outstanding + Overdue cards if any payments are past due
5. Scrolls to Recent Deals: last 5 deals with status badge + received % indicator
6. Clicks any deal row → navigates to deal detail page
7. Clicks "View all" → navigates to /deals list
8. Clicks "+ New deal" → navigates to /deals/new

## States

**Zero state:** Tagline + "Add your first deal" button. Identical to the old home page — familiar, low friction, single action.

**Loading state:** SSR — no loading spinner. Content renders on navigation. Next.js Suspense boundaries not needed here since it's a full server render.

**Success state:** 4 financial cards + deal list. The numbers tell the creator what to do next: if "Overdue" is red with a value, they need to follow up on a payment.

**Error state:** If API is unreachable at SSR time, `getDashboardData()` returns null → falls back to the empty state zero-state UI. Creator can still navigate to deals. No broken page.

**Data state — no payments:** Contracted shows deal values, Received shows ₹0, Outstanding shows full contracted amount. This is correct and intentional.

## Critic Feedback

**First use:** "Oh — I can see everything at once. Contracted ₹2.4L, Received ₹80K, Outstanding ₹1.6L. That's exactly the number I've been computing in my head every morning."

**After a month:** "I open this every morning. The red 'Overdue' card is a natural alarm — when I see it I know someone needs a follow-up WhatsApp."

**Weakness 1:** The 4th card switches label ('Overdue' vs 'Active deals') — this inconsistency could confuse on first use. Rationale: overdue is more urgent than active count; the alert state overrides the default.

**Weakness 2:** Recent Deals shows max 5. If a creator has 20 active deals, they need to click "View all" to see the full list. Acceptable for Phase 1 — dashboard is an overview, not a list replacement.

**Weakness 3:** No date filter. "Show me this month only" is a common ask. Phase 2 or Phase 3 feature.

**What makes them tell another creator:** "It tells me exactly how much I'm owed without me doing anything."

**What makes them churn:** If the numbers are wrong. Overdue showing 0 when something is overdue, or Outstanding higher than expected. Correctness is the single most important metric here.

## Accessibility

- Keyboard navigation: All links (deal rows, "View all", "+ New deal") are keyboard focusable
- `aria-labelledby` on both sections (`summary-heading`, `recent-deals-heading`)
- Financial summary heading is visually hidden (`sr-only`) but present for screen readers
- WCAG 2.2 AA: Compliant. Overdue state uses red color + "Overdue" text label (not color-only)
- Focus indicators: Tailwind ring-2 focus-visible styles
- Status badges use text labels per existing pattern
