# Decision: Revenue Dashboard
Date: 2026-04-04
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Replace the home page placeholder with a real-time financial snapshot: total
contracted value, total received, outstanding balance, overdue payment count,
and a list of the 5 most recent deals with their payment status. Data is served
from a single `GET /api/v1/dashboard` endpoint that joins deals and payments in
one Prisma query.

## Why Now
Both core data types (deals + payments) exist. A creator with 5 deals and 8
payment milestones still has to click into each deal to understand their financial
position. The dashboard makes the system feel like a financial outcome engine on
first open — not a CRM. Without it, there is no reason to return to the product
daily. The home page is today the least valuable screen; it should be the most valuable.

## Why Not "Just aggregate from the deals list page"
The deals list page is paginated (default 20 per page). It doesn't include payments.
Computing a financial summary requires joining across all deals and all payments —
this is a backend aggregation concern, not a UI concern.

## Why Not "Build deliverable tracking first"
Deliverable tracking requires a new data model, new API routes, and new UI. The
dashboard uses data that already exists with zero new tables. Revenue dashboard
has higher immediate value per implementation cost.

## Why Not "Currency conversion for multi-currency summary"
Phase 1 creators are primarily INR-based. Multi-currency conversion requires
exchange rate APIs (external dependency, Phase 4). For Phase 1: sum raw numbers
and display the dominant currency. Limitation is documented. Creators with mixed
currencies will see their dominant currency label.

## User Without This Feature
1. Creator opens the app — sees a tagline and a "View my deals" button
2. They click through to the deals list to see their 5 deals
3. They click each deal to see its payment status
4. Mental arithmetic: ₹80K + ₹45K - ₹60K received = ₹65K outstanding?
5. They open a spreadsheet to track the aggregate number they care about
6. Every morning: repeat

## Success Criteria
- Home page renders financial summary in <200ms (SSR)
- Dashboard shows correct totalContracted, totalReceived, outstanding
- Overdue count is non-zero when overdue payments exist
- Recent deals list shows last 5 deals with payment indicators
- Empty state shows clear CTA when no deals exist
- ≥90% test coverage on new API code

## Assumptions (to be validated)
- Creators will open the home page first on each session
- A single-number financial summary is more useful than per-deal drill-down on home
- 5 recent deals is the right number (not 3, not 10)
- Dominant currency is an acceptable simplification for Phase 1
