# Retro: Revenue Dashboard
Shipped: 2026-04-04

## What Was Built

A real-time financial overview dashboard on the home page. Replaces a static marketing placeholder with 4 summary cards (Contracted / Received / Outstanding / Overdue) and a list of the 5 most recent deals with their payment status. Served SSR via a new `GET /api/v1/dashboard` endpoint that joins deals + payments in a single Prisma query. Empty state preserved when no deals exist.

## Decisions Made (and why)

**Single `/api/v1/dashboard` endpoint, not N+1 from the web:** The alternative was fetching the deals list then each deal's payments separately. With 20 deals, that's 21 API calls. The aggregate endpoint is one query and returns everything the home page needs.

**`dominantCurrency` = mode, not fixed INR:** Most Phase 1 creators are INR-only. But the code is honest — if someone has 3 USD deals and 1 INR deal, the display shows USD. No silent assumptions.

**SSR for the home page, not client-side fetch:** Dashboard data should be visible on first paint. SSR is already the pattern for the deal detail page. Consistent.

**exactOptionalPropertyTypes caught again:** `SummaryCard` had `subtext?: string` — same issue as `InputProps.error` in the previous feature. Pattern established: any optional prop in a web component must be explicitly typed as `T | undefined`. This will be the default for all future components.

**Empty state shows "Add your first deal" not "View my deals":** Changed the original CTA to be more direct. If there are no deals, the right action is to create one.

## What the Critic User Said

"Finally — I open the app and it tells me my number. ₹1.6L outstanding, ₹40K overdue. I know exactly what I need to do."

Hardest part: ensuring overdue logic was consistent between PaymentSection (deal detail) and the dashboard aggregate. The `computeIsOverdue` function in `@oompa/types` ensures both surfaces use identical logic.

## Post-Deploy Baseline

No production deployment yet. First metric reading on first deploy.

## What To Watch

- Dashboard P99 latency as deal count grows — add Redis cache if > 200ms
- Overdue payment follow-up rate — primary signal that the dashboard is driving action
- Error rate on `/api/v1/dashboard` — should be near zero (no mutations, pure read)

## What We'd Do Differently

- Establish a lint rule or tsconfig plugin to enforce `T | undefined` on optional props for `exactOptionalPropertyTypes` compliance — caught manually each time, should be automatic
- Add a test for the web SSR fallback (null API → empty state) — currently untested at the integration level
