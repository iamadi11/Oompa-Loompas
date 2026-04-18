# Test Plan: Upcoming Payment + Deliverable Push Notifications

## Coverage Baseline
- Pre-existing push job: 10 tests (overdue payments, due-today deliverables, subscription lifecycle)
- Post-change: 22 tests

## Test Cases

| # | Scenario | Type | File |
|---|----------|------|------|
| 1 | Empty inputs → empty payloads | pure | push-notifications.test.ts |
| 2 | Overdue payment copy + plural "days" | pure | push-notifications.test.ts |
| 3 | Singular "day" when daysOverdue=1 | pure | push-notifications.test.ts |
| 4 | Due-today deliverable copy | pure | push-notifications.test.ts |
| 5 | MAX_NOTIFICATIONS_PER_USER cap enforced | pure | push-notifications.test.ts |
| 6 | Mixed overdue + due-today fills cap | pure | push-notifications.test.ts |
| 7 | SOT §25.2 — no amounts in body | pure | push-notifications.test.ts |
| 8 | Upcoming payment 2 days — copy + URL | pure | push-notifications.test.ts |
| 9 | Upcoming payment singular "day" (1) | pure | push-notifications.test.ts |
| 10 | Upcoming payment daysUntilDue=0 → "due today" | pure | push-notifications.test.ts |
| 11 | Upcoming deliverable 3 days — copy + URL | pure | push-notifications.test.ts |
| 12 | Priority order: overdue→dueToday→upcomingPayment→upcomingDeliverable | pure | push-notifications.test.ts |
| 13 | SOT §25.2 — no amounts in upcoming payment body | pure | push-notifications.test.ts |
| 14 | I/O: fires for overdue payment (3+ days) | integration | push-notifications.test.ts |
| 15 | I/O: fires for due-today deliverable | integration | push-notifications.test.ts |
| 16 | I/O: fires for upcoming payment (2 days) | integration | push-notifications.test.ts |
| 17 | I/O: fires for upcoming deliverable (3 days) | integration | push-notifications.test.ts |
| 18 | I/O: no send when all queries empty | integration | push-notifications.test.ts |
| 19 | I/O: removes stale subscription on 410 | integration | push-notifications.test.ts |
| 20 | I/O: no removal on non-410 error | integration | push-notifications.test.ts |
| 21 | I/O: multiple users get independent results | integration | push-notifications.test.ts |

## Edge Cases
- `daysUntilDue = 0` — payment due today treated as "due today" not "due in 0 days"
- `daysUntilDue = 1` — singular "day" not "days"
- All 4 categories full → only first 3 (cap) sent, priority order preserved
- Upcoming deliverables exclude today — `getDueTodayDeliverables` covers that window

## Failure Modes
- DB timeout per query → caught by per-user try/catch, logged, other users unaffected
- `webpush.sendNotification` 410 → subscription deleted, does not block other subs
- `webpush.sendNotification` non-410 → logged, continues

## Coverage Target
≥90% on `apps/api/src/jobs/push-notifications.ts` — confirmed green via vitest coverage report.
