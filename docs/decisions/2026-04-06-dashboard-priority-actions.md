# Decision: Dashboard priority actions
Date: 2026-04-06
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Extend `GET /api/v1/dashboard` with a `priorityActions` array (capped at 10) listing overdue payments and overdue pending deliverables across all deals, sorted by due date (oldest first), then by kind (payments before deliverables) for ties. The home page renders a **What to do next** section when any actions exist.

## Why Now
The financial summary answers “how am I doing?” but not “what should I do next?” — which SOURCE_OF_TRUTH and UX rules require for every screen. Creators lose money when follow-ups slip; surfacing overdue items on first open reduces leakage without new tables or integrations.

## Why Not “Build email reminders first”
Reminders need Notification module, templates, consent, and delivery monitoring. This slice uses existing Prisma data and one query shape change; it is the smallest system that changes behavior today.

## Why Not “Only show overdue payments”
Deliverables already drive revenue timing (late posts → strained brand relationships). The same overdue helpers exist in `@oompa/types`; combining both in one list matches how creators mentally prioritize their week.

## User Without This Feature
1. Open home → see totals and recent deals.
2. Notice high “Outstanding” but must open each deal to find which payment or post is late.
3. Risk: they act on the wrong deal or defer until spreadsheets.

## Success Criteria
- Dashboard response includes deterministic `priorityActions` for all overdue payments (PENDING/PARTIAL + past `dueDate`) and overdue PENDING deliverables (past `dueDate`).
- Home shows an obvious, keyboard-focusable list linking to the relevant deal.
- API tests cover ordering, deliverables, and cap.

## Assumptions (to be validated)
- Creators want payments ranked before deliverables when due dates tie (revenue-first).
- Ten items is enough for daily triage; overflow can move to a future “full queue” view.
