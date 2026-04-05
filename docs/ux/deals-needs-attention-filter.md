# UX: Deals “needs attention” filter

## User journey
1. Open **Deals** from nav.
2. Choose **All deals** or **Needs attention** (amber highlight when active).
3. Open a deal from the filtered list to resolve payments or deliverables.

## States
- **All deals:** Default; subtitle shows deal count.
- **Needs attention:** Subtitle clarifies “deals with overdue work”; may be zero.
- **Needs attention, zero matches:** Title **You're all caught up**, explanation that nothing is overdue, primary **View all deals**, secondary **Back to overview**. Page header still shows **Add deal** (copy also mentions adding a deal).
- **All deals, zero deals:** Title **No deals yet**, primary **Add deal**, secondary **Back to overview**; header hides duplicate **Add deal**.
- **Attention page:** Footer link “Browse deals with overdue work” applies the same filter.

## Accessibility
- Filter is a `<nav aria-label="Deal filters">` with two links; `aria-current="page"` on the active filter.

## Browser MCP checklist

Automated pass/fail log: [docs/testing/browser-ux-checklist-deals-needs-attention-2026-04-06.md](../testing/browser-ux-checklist-deals-needs-attention-2026-04-06.md).
