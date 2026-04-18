# Test Plan: Scheduled Payment Reminders

## Coverage baseline
- push-notifications.test.ts: 26 tests (was 22 before this feature)
- payments service: existing 3 unit tests (no new logic)
- E2E: 6 new tests in payments.spec.ts

## Test cases

| # | Case | Type | File |
|---|------|------|------|
| 1 | `buildNotificationPayloads` includes scheduled reminder in payloads | unit | push-notifications.test.ts |
| 2 | Scheduled reminder priority: fires before due-today deliverables | unit | push-notifications.test.ts |
| 3 | `getScheduledRemindersToday` clears `remindAt` after querying | I/O test | push-notifications.test.ts |
| 4 | No `updateMany` call when no reminders fire | I/O test | push-notifications.test.ts |
| 5 | Pending payment shows "Remind me" button | E2E | payments.spec.ts |
| 6 | Clicking "Remind me" reveals date picker | E2E | payments.spec.ts |
| 7 | Selecting a date sets reminder chip, hides button | E2E | payments.spec.ts |
| 8 | Clearing reminder restores "Remind me" button | E2E | payments.spec.ts |
| 9 | RECEIVED payment does not show "Remind me" | E2E | payments.spec.ts |

## Edge cases
- `remindAt` in UTC midnight: cron's `startOfDay(now)` window aligns exactly
- Already-received/refunded payments excluded from reminder query (`status NOT IN RECEIVED, REFUNDED`)
- `updateMany` runs before push send — if push fails, reminder is consumed (acceptable, daily follow-up)
- `MAX_NOTIFICATIONS_PER_USER=3` cap respected across all 5 types
- REFUNDED payment: "Remind me" hidden (same `canShareReminder` gate as share button)

## Coverage target
≥90% on changed files. push-notifications.ts pure functions 100% branch-covered.
