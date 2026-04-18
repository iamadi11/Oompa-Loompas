# Architecture: Upcoming Payment + Deliverable Push Notifications

## Module
Notification module — `apps/api/src/jobs/push-notifications.ts`

## Data Flow
```
Daily cron → runDailyPushJob(now)
  → prisma.pushSubscription.findMany (all users)
  → per user, parallel:
      getOverduePayments(userId, now)           [existing]
      getDueTodayDeliverables(userId, now)      [existing]
      getUpcomingPayments(userId, now)          [NEW]
      getUpcomingDeliverables(userId, now)      [NEW]
  → buildNotificationPayloads(overdue, dueToday, upcomingPayments, upcomingDeliverables)
  → sendToUserSubscriptions(subs, payload) per payload
```

## Schema Changes
None. All data is from existing `payments.due_date` and `deliverables.due_date` columns.

## New Interfaces
```ts
UpcomingPaymentItem { dealId, brandName, daysUntilDue }
UpcomingDeliverableItem { dealId, deliverableTitle, brandName, daysUntilDue }
```

## Query Windows
- `getUpcomingPayments`: `dueDate IN [todayStart, todayStart + 4 days)`, status NOT IN [RECEIVED, REFUNDED]
- `getUpcomingDeliverables`: `dueDate IN [tomorrowStart, todayStart + 4 days)`, status = PENDING
  - Excludes today — `getDueTodayDeliverables` already covers it

## Notification Priority (within MAX_NOTIFICATIONS_PER_USER=3 cap)
1. Overdue payments (most urgent — money already late)
2. Deliverables due today (deadline today)
3. Upcoming payments (due in 1–3 days)
4. Upcoming deliverables (due in 1–3 days)

## Notification Copy
- Upcoming payment: `title="Payment due soon"`, `body="{brandName} payment due in {N} day(s)"`
- Upcoming deliverable: `title="Deliverable due soon"`, `body="{title} due in {N} day(s) for {brandName}"`
- No amounts in body (SOT §25.2)

## Days Until Due Calculation
```ts
const todayDay = Math.floor(now.getTime() / ONE_DAY_MS)
const dueDay = Math.floor(dueDate.getTime() / ONE_DAY_MS)
const daysUntilDue = dueDay - todayDay  // 0=today, 1=tomorrow, 2=day after, 3=3 days
```

## Scale
N users × 4 DB queries = 4N queries per cron run. At 10K users: 40K queries per day (01:30 UTC). Acceptable — Prisma connection pool handles this. No caching needed at this scale.

## Tech Choices
- Pure function extension — same pattern as existing `buildNotificationPayloads`
- Injectable `now` parameter — deterministic tests without time mocking
- Parallel queries per user — same as existing pattern
