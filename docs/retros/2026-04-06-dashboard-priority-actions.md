# Retro: Dashboard priority actions
Shipped: 2026-04-06 (code + docs; deploy via your pipeline)

## What was built
Dashboard API now returns up to ten prioritized overdue payment and deliverable actions; the home page shows **What to do next** when the list is non-empty, linking into each deal.

## Decisions made (and why)
- **Single endpoint:** Avoids an extra request and keeps the home screen one aggregation.
- **Sort order:** Due date ascending, then payments before deliverables — optimizes for cash recovery without hiding creative obligations.
- **Cap 10:** Keeps the home screen scannable; acknowledges a future full backlog view.

## What the critic user said
“Finally tells me where to click” — but they will still ask for snooze and templates; out of scope for this iteration.

## Post-deploy baseline
Not captured in production from this environment; use `priorityActions.length` from `/api/v1/dashboard` in staging/production when available.

## What to watch
Support questions about “why isn’t X listed” (status/due date rules).  
Performance of `findMany` with full graph as deal count grows.

## What we’d do differently
Add an integration test that runs the real Prisma path once CI has Postgres, to complement mocked handler tests.
