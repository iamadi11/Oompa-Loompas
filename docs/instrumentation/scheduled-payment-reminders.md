# Instrumentation: Scheduled Payment Reminders

## Hypothesis
If creators can schedule a reminder, they will use it to follow up on overdue payments, reducing days-to-receive. Expected: ≥20% of PENDING payments with due dates get a `remindAt` set within 30 days of shipping.

## Baseline (pre-ship)
- All `payments.remind_at` values are NULL (column added in this release)
- No measurement of manual follow-up rate

## Post-deploy signals

| Signal | Query / Source | Threshold |
|--------|---------------|-----------|
| Reminders set per day | `SELECT COUNT(*) FROM payments WHERE remind_at IS NOT NULL` | >0 within 48h of deploy |
| Reminders fired (cleared) per cron run | API logs: `[CRON] Starting daily push notification job` + `scheduledReminders` array length | Fires on any day a creator set a reminder |
| Push delivery errors | API logs: `[CRON] Push send error` or stale subscription warnings | <5% of send attempts |
| Reminder adoption rate | `COUNT(payments WHERE remind_at WAS set) / COUNT(PENDING payments)` over 30d | ≥20% target |

## What to read post-deploy
- API server logs for `[CRON]` lines at 01:30 UTC
- `payments` table: `SELECT remind_at, COUNT(*) FROM payments GROUP BY remind_at IS NOT NULL`

## Rollout plan
Standard deploy — no feature flag needed. `remindAt` field is nullable; existing payments unaffected. Migration is additive (new nullable column + index).
