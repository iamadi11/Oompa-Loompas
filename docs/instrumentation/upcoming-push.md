# Instrumentation: Upcoming Payment + Deliverable Push Notifications

## Hypothesis
If creators receive push notifications for items due in 1–3 days, they will act (send reminder, prepare deliverable) before the due date, reducing the % of payments that become overdue and the % of deliverables that miss their deadline.

## Baseline (pre-deploy)
- Metric to capture: % of payments that enter `daysOverdue > 0` state within 7 days of due date
- Current baseline: not yet measured — establish via DB query on deploy day:
  ```sql
  SELECT COUNT(*) FILTER (WHERE status NOT IN ('RECEIVED','REFUNDED') AND due_date < NOW())
       / COUNT(*) AS overdue_rate
  FROM payments
  WHERE due_date >= NOW() - INTERVAL '30 days';
  ```

## Post-Deploy Signals

| Signal | Where to read | Target |
|--------|---------------|--------|
| Push sends per cron run | API logs `[CRON]` grep | >0 "Payment due soon" / "Deliverable due soon" sends within 48h |
| Stale subscription 410 removals | API logs `[CRON] Removing stale` | Expected — healthy cleanup |
| Payment overdue rate (30-day rolling) | DB query above | ↓ vs baseline within 14 days |
| Deliverable completion before due date | `completed_at <= due_date` rate | ↑ vs baseline |

## Rollout Plan
No feature flag needed — this is a server-side cron extension with no user-facing toggle. Rolls out with deploy. Observe first 3 cron runs (3 days) for unexpected send volume or errors.

## What to Watch (First 72h)
1. Cron log at 01:30 UTC — confirm no errors in new query paths
2. `webpush.sendNotification` call count — should be proportional to active subscribers × items due
3. Spike in 410 removals — would indicate stale subscriber list (expected cleanup, not an issue)
