# Retro: Upcoming Payment + Deliverable Push Notifications

**Date:** 2026-04-18  
**Version:** v0.5.1

## What Was Built
Extended the daily push notification cron to send proactive alerts for payments and deliverables due in 1–3 days. Previously the cron only fired for items already overdue (3+ days past due) and deliverables due today. Now covers the full pre-due window.

## Decisions + Why
- **Calendar-day arithmetic via `Math.floor(ms / ONE_DAY_MS)`** over floating-point subtraction — avoids sub-day rounding errors when `now` is mid-day
- **Separate `getUpcomingPayments` and `getUpcomingDeliverables` queries** instead of one mega-query — cleaner WHERE clauses, easier to read, and `take: 3` cap makes the extra query negligible
- **`getUpcomingDeliverables` starts from `tomorrowStart`** not `todayStart` — avoids duplicating `getDueTodayDeliverables` which already covers today's deliverables
- **`getUpcomingPayments` starts from `todayStart`** — payments due today were not covered by any existing query
- **Extracted `startOfDay()` and `pluralDays()` helpers** in simplify pass — removed 3x duplication of midnight calculation and day pluralization

## What Went Well
- Zero schema changes — all data already existed in `payments.due_date` and `deliverables.due_date`
- Pure function extension — `buildNotificationPayloads` stayed testable, injectable `now` param preserved
- Tests went failing → green in one implementation pass (22 tests, all pass)
- Simplify pass caught meaningful cleanup (3x duplication of `startOfDay`, 3x pluralization)

## Post-Deploy Baseline to Watch
- Cron logs at 01:30 UTC — confirm "Payment due soon" / "Deliverable due soon" sends appear
- Payment overdue rate (30-day rolling) — establish baseline day 1, watch for ↓ over 14 days
- No errors in new query paths (getUpcomingPayments / getUpcomingDeliverables)

## What to Do Differently
- Could add composite DB index `(dealId, dueDate)` on payments + deliverables for better query planner selectivity — deferred as acceptable at 10K users with `take: 3` cap
