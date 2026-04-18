# Decision: Scheduled Payment Reminders

**Date:** 2026-04-18  
**Phase:** 1 — Deal + Payment Intelligence  
**Status:** Approved

## What
Let creators pick a specific date on any payment milestone to be reminded via push notification. On that morning the cron fires a push: "Payment reminder — [Brand] payment · tap to follow up." Creator taps → opens deal → shares reminder to brand.

## Why Now
- Push notification cron (v0.4.7) + VAPID + service worker are live
- Phase 1 explicit backlog: "Scheduled payment reminders (closes revenue loop)"
- Previous blocker was "no BullMQ worker" — daily cron already handles this with ≤24h resolution (acceptable for payment follow-up)
- Zero new infrastructure; one DB column + small UI

## Why Not Alternatives
- **Automated email reminders**: needs email provider, HTML templates, unsubscribe — Phase 2
- **Auto-scheduled reminders** (system picks date): creator should control when to reach out; not all brands are the same
- **Calendar export (ics)**: creator leaves app and maintains a separate system; misses the share-reminder one-tap path

## User Without This
Creator has a ₹80K payment due May 1. They want to send a WhatsApp reminder on April 24 (7 days before). Currently: open Google Calendar, create reminder "remind Acme about payment," set date/time, manually compose and send. With this: open deal → "Remind me" on payment row → pick April 24 → done. Morning of April 24, push fires, creator taps, shares reminder.

## Success Criteria
- Creator can set `remindAt` date on any non-received payment
- Push fires on the morning of `remindAt` (01:30 UTC cron run)
- After push fires, `remindAt` is cleared (one-shot)
- Creator can clear a scheduled reminder before it fires
- No push if payment is already RECEIVED or REFUNDED at fire time
- No amounts in push payload (SOT §25.2)

## Assumptions
- Creator has push notifications enabled (already opt-in via Settings)
- 24h resolution (fires morning of the chosen date) is sufficient for payment follow-up
- `remindAt` is creator-owned: system does not auto-set it
