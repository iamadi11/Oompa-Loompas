# Decision: PWA Push Notifications — Payment Overdue Alerts
Date: 2026-04-11
Phase: Phase 1.5 — PWA Engagement Layer
Status: APPROVED

## What
Web Push notifications (VAPID, opt-in) that alert creators when a payment is 3+ days overdue or due within 24 hours, and when a deliverable is due today. Notifications deep-link to the relevant deal page. Opt-in managed in a new `/settings/notifications` page. Server sends pushes via a daily `node-cron` job in the Fastify process. Subscriptions stored in a new `push_subscriptions` DB table.

## Why Now
- Install prompt (0.3.2) + offline banner shipped → consent UI foundation complete
- Feature candidates doc ranks this #1 in Phase 1.5
- SOT §25 specifies exact triggers, copy rules, and opt-in requirements
- Karan (primary user, ₹60K/month) doesn't check Oompa daily → overdue payments sit unremedied → revenue leakage
- 3+ days overdue is the highest-risk trigger: relationship damage risk rises sharply after 3 days

## Why Not BullMQ
Phase 2 — not yet provisioned. `node-cron` inside Fastify covers Phase 1.5 needs: single process, daily job, no persistence required beyond DB subscription rows.

## Why Not Email Reminders
Phase 2 — requires email provider integration, unsubscribe links, compliance. Out of scope.

## Why Not Push on Every Overdue Payment Immediately
SOT §25 caps at 3 notifications/day per creator. Daily cron (00:00 UTC) is simpler, deterministic, and avoids thundering-herd on overdue creation. Real-time push is Phase 2 with BullMQ.

## User Without This Feature
Karan closes laptop at 9pm. BrandX payment is 4 days overdue. He doesn't open Oompa the next day. The brand goes cold and moves on. Karan chases 5 days later — awkward, slower to collect.

With push: 9am notification "BrandX payment ₹18,000 is 4 days overdue" → one tap → deal page → copies reminder → sends WhatsApp → resolves same day.

## Success Criteria
- Creator can opt in to push notifications in < 2 clicks from workspace
- Service worker registers VAPID subscription and sends to API
- Daily cron detects overdue payments (3+ days) and due-today deliverables per opted-in creator
- Push notification shows brand name + amount + days overdue (specific, not generic)
- Notification click deep-links to `/deals/:id`
- Max 3 notifications per day per creator respected
- Opt-out accessible in one tap from notification settings
- No notification payload contains payment amounts (SOT §25 privacy rule)

## Assumptions
- Single Fastify process is stable enough for daily cron in Phase 1.5 (no HA concern)
- VAPID key pair generated once, stored in env vars (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`)
- Browser push support sufficient for primary users (Android Chrome, modern iOS Safari 16.4+)
- `web-push` npm package for VAPID signing (well-maintained, no external service)
- Push payload MUST NOT include rupee amount — notification copy uses "payment overdue" + brand + days (per SOT §25)
