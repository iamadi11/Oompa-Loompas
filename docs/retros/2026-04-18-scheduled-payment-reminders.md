# Retro: Scheduled Payment Reminders

**Date:** 2026-04-18  
**Version:** 0.5.2

## What was built
Creator-controlled one-shot push reminders on payment milestones. Creator picks a date, cron fires that morning, clears the date (no repeat). Built on existing VAPID push infra from 0.5.0.

## Key decisions

| Decision | Why |
|----------|-----|
| One-shot semantics (clear on fire) | Prevents daily re-firing; creator can reschedule if needed |
| UTC midnight storage | Aligns with cron's `startOfDay(now)` UTC window; avoids timezone edge cases |
| No amount in push payload | SOT §25.2 privacy rule — consistent with all other push types |
| `NotificationItems` object refactor | 5 priority types → positional args became confusing; named object is self-documenting |
| `updateMany` before push send | Exactly-once intent: if push fails, reminder is consumed; acceptable for daily follow-up context |

## Critic feedback addressed
- "Remind me" label is creator-intent language, not "Set push notification" — matches mental model
- Date picker inline in payment row (no modal) — low friction
- Chip shows formatted date, not ISO string — readable at a glance

## Post-deploy baseline
- `payments.remind_at`: all NULL pre-ship (column new)
- Watch: reminders set within 48h of deploy

## What to watch
- Creators setting reminders and then immediately clearing them (UX confusion signal)
- Push failures after remind_at cleared (stale subscription cleanup handling)

## What to do differently
- DB migration could be applied via `prisma migrate deploy` in CI; manual psql was needed in local dev because migration wasn't automatically applied — add migration step to local dev docs
