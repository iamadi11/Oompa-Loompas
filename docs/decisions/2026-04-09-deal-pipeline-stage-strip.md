# Decision: Deal pipeline stage strip

Date: 2026-04-09
Phase: 1 (Deal + Payment Intelligence)
Status: APPROVED

## What

A **status filter strip** on the `/deals` page showing per-status deal counts (DRAFT / NEGOTIATING / ACTIVE / DELIVERED / PAID / CANCELLED). Clicking a status tab filters the visible deal list to that stage. Counts are computed server-side from the full unfiltered deal list. No new API endpoints, no Kanban, no drag-and-drop.

## Why Now

Clipboard payment reminders (0.2.1) are shipped. The next Phase 1 gap is **deal orientation** — creators with multiple deals have no way to see "what's stuck" or "which deals are awaiting payment" without scrolling the full list. The pipeline strip answers "how many deals are in each stage" instantly and lets creators filter to the stage that needs action. Statuses (`DRAFT`, `NEGOTIATING`, `ACTIVE`, `DELIVERED`, `PAID`, `CANCELLED`) and the API filter (`?status=X`) already exist — this is a pure presentation and routing layer.

## Why Not scheduled email reminders

Requires Notification module, worker, email provider, explicit consent, bounce handling. Correct problem, wrong smallest step for Phase 1.

## Why Not shareable proposal link

Requires a new artifact type (proposal), public URL with access control, and a "proposal" concept not yet in the data model. More infra, lower immediate outcome.

## User Without This Feature

Creator opens `/deals`, sees a flat list of 8 deals sorted by creation date. Wants to know which deals are waiting on payment → manually reads each status badge, or visits each deal individually. Typical manual flow: scroll → read badge → note deal → repeat.

## Success Criteria

- Creator sees per-status counts at a glance from `/deals`.
- Clicking `DELIVERED` shows only delivered deals in under 100ms (optimistic: no API re-fetch, filters in server component).
- Status strip renders correctly in zero-deal and single-status scenarios.
- All existing filter paths (`?needsAttention=true`) continue to work unchanged.
- Tests lock `getDealStatusFilter` and `computeStatusCounts` determinism.

## Assumptions (to be validated)

- Creators think in deal stages and find filtering by stage useful.
- 100-deal limit on the unfiltered fetch is sufficient for current user scale.
- Counts from the unfiltered list are fresh enough (same RSC request as the page).
