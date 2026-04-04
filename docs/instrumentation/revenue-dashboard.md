# Instrumentation: Revenue Dashboard

## Hypothesis

If creators see their financial summary on the home page, they will open the app more frequently and take action on overdue payments faster. Expected: average session start time drops from "navigate to deals list first" to "home page read as entry point." Overdue follow-up rate (payments moving from PENDING to RECEIVED after being overdue) should increase within 14 days.

## Baseline

Before this feature:
- Home page is a static marketing page — zero financial signal
- Creators must navigate to each deal individually to understand their position
- No aggregate overdue signal exists anywhere in the UI

## Post-Deploy Signals

| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| `GET /api/v1/dashboard` response time | API logs | P99 > 300ms |
| `GET /api/v1/dashboard` error rate | API logs | > 0.1% of requests |
| Payments marked RECEIVED after being overdue | DB query: count payments updated to RECEIVED where dueDate < updatedAt | Trending up = working |
| Home page → deal detail navigation | Next.js access logs (referrer) | N/A (qualitative) |

## Rollout Plan

Immediate full rollout. Dashboard is purely additive — home page reads existing data, no new tables, no user-facing mutations. Rollback = revert `apps/web/app/page.tsx` to the static placeholder.
