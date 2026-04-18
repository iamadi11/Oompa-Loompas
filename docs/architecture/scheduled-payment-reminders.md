# Architecture: Scheduled Payment Reminders

## Module
Payment module (API) · Notification module (cron)

## Data Flow
```
Creator taps "Remind me" on PaymentRow → picks date
  → PATCH /api/v1/payments/:id { remindAt: "2026-04-25T00:00:00.000Z" }
  → payment.remind_at = '2026-04-25 00:00:00'

Daily cron (01:30 UTC) → runDailyPushJob(now)
  → per user: getScheduledRemindersToday(userId, now)
    → query: payments WHERE remind_at IN [todayStart, tomorrowStart) AND status NOT IN [RECEIVED, REFUNDED]
    → updateMany: remind_at = NULL  (mark as consumed — one-shot semantics)
  → buildNotificationPayloads({ scheduledReminders, ... })
  → sendToUserSubscriptions(subs, payload) per payload
```

## Schema Changes

### Migration: `20260418120000_add_payment_remind_at`
```sql
ALTER TABLE payments ADD COLUMN remind_at TIMESTAMPTZ;
CREATE INDEX payments_remind_at_idx ON payments(remind_at);
```
Forward-compatible: nullable with no default. Safe to deploy before code ships.

## API Contract

### PATCH /api/v1/payments/:id
Added field:
- `remindAt: string (ISO 8601 datetime) | null` — nullable, optional
- Auth required (existing auth guard)
- Stored as-is; cron normalizes window in UTC

### GET /api/v1/deals/:id (payment serialization)
Added field to Payment response:
- `remindAt: string (ISO) | null`

## Notification Priority (within MAX_NOTIFICATIONS_PER_USER=3 cap)
1. Overdue payments (money already late)
2. Scheduled reminders (creator explicitly chose today)
3. Deliverables due today
4. Upcoming payments (auto 3-day window)
5. Upcoming deliverables (auto 3-day window)

## Notification Copy
- title: `"Payment reminder"`
- body: `"{brandName} payment — time to send your follow-up"`
- url: `"/deals/{dealId}"`
- No amounts (SOT §25.2)

## One-Shot Semantics
`getScheduledRemindersToday` clears `remindAt = NULL` immediately after fetching (before sending push). This guarantees exactly-once delivery: if send fails, the reminder is still consumed (cron won't re-fire tomorrow). Acceptable for a daily follow-up reminder.

## `remindAt` Date Semantics
Creator picks a date (YYYY-MM-DD). Frontend stores midnight UTC: `new Date(dateStr).toISOString()`. Cron on server runs in UTC. `startOfDay(now)` = midnight UTC of current UTC date. Window: `[midnightUTC_today, midnightUTC_tomorrow)`. Match is exact.

## `buildNotificationPayloads` Refactor
Changed from 4 positional args to `NotificationItems` object:
```ts
interface NotificationItems {
  overduePayments: OverduePaymentItem[]
  scheduledReminders: ScheduledReminderItem[]
  dueTodayDeliverables: DueTodayDeliverableItem[]
  upcomingPayments: UpcomingPaymentItem[]
  upcomingDeliverables: UpcomingDeliverableItem[]
}
```
Motivated by 5 input types — object prevents positional confusion.

## Scale
N users × 5 DB queries = 5N queries/day at 01:30 UTC. At 10K users: 50K queries. Acceptable — same scale analysis as v0.5.1. Scheduled reminder query has additional `updateMany` (but result set is tiny: at most 3 rows).

## UI Changes
`PaymentRow`:
- "Remind me" button (only when payment not RECEIVED/REFUNDED)
- Date picker opens on click
- Submits `remindAt` as ISO string via PATCH
- If `remindAt` set: shows "Remind [date]" chip with × to clear
- Clearing = PATCH with `remindAt: null`
