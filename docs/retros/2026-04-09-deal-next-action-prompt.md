# Retro: Deal Next-Action Prompt
Shipped: 2026-04-09

## What Was Built
A contextual banner on the deal detail page that detects when a deal is ready to advance to its next status and offers a one-click CTA. The banner uses pure computation from data already on the page (deal status + payment statuses + deliverable statuses). On click it calls the existing `PATCH /api/v1/deals/:id` endpoint and refreshes the RSC page. Zero new API endpoints, zero schema changes, zero migrations.

## Decisions Made (and why)
- **`computeDealNextAction` in `@oompa/types` not in web:** Pure business logic belongs in the shared types package — it's testable in isolation, will be reusable in a future worker or intelligence module, and keeps the component thin.
- **No optimistic update:** The status transition is server-authoritative and guarded by `isValidStatusTransition`. Showing stale state would be misleading. The RSC refresh is fast enough (~100ms in local) that no intermediate state is needed.
- **`role="status" aria-live="polite"` on the banner:** Screen readers announce the suggestion when the banner mounts — this is the first thing the user should know after the deal header.
- **Green color for DELIVERED/PAID suggestions:** Positive signal (progress toward paid). Red is reserved for overdue/warning states. The design reads "you're almost there" not "something is wrong."
- **`shareToken: null` fix in API test:** Pre-existing issue from 0.2.3. Fixed alongside this change since it was blocking the typecheck CI gate.

## What the Critic User Said
"One click and it was done. I didn't even read the description." — That's the right outcome. The button label ("Close deal") and green color create enough signal that the description is supplementary. The status badge changing from "Delivered" to "Paid" in the header is the moment of satisfaction.

The one friction point: "What if I close it by accident?" — PAID has no outbound transitions in the current system. This is a known design constraint. The current risk is low because the banner only appears when ALL payments are received, which is a reliable terminal precondition. If undo is needed in a future iteration, it can be added as a PAID → CANCELLED → re-open flow.

## Post-Deploy Baseline
- PATCH `/api/v1/deals/:id` with `status: PAID` returned 200 ✓
- RSC re-fetch returned deal with updated status ✓
- Status badge updated from "Delivered" to "Paid" ✓
- Banner disappeared for PAID deal ✓
- All 340 tests green across packages ✓

## What To Watch
- Are creators using the banner or still using the edit form? (Monitor PATCH /api/v1/deals/:id traffic)
- Any deals stuck in DELIVERED with 0 PAID conversions? (check in 2 weeks)

## What We'd Do Differently
- Should have caught the `shareToken: null` test fixture gap in 0.2.3 at the time — the `serializeDeal` type change should have triggered a test fixture audit.
- The `launch.json` web server config had a hardcoded `-p 3000` flag that prevented `autoPort` from working — fixed during this session.
