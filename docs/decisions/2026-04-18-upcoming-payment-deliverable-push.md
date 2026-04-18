# Decision: Upcoming Payment + Deliverable Push Notifications

**Date:** 2026-04-18  
**Phase:** 1.5 — PWA Engagement Layer  
**Status:** Approved

## What
Extend the daily push notification cron (v0.4.7) to also send push alerts for payments due within the next 1–3 days and deliverables due within the next 1–3 days. Currently the cron only notifies for items that are already overdue.

## Why Now
- Push infrastructure is fully live (subscriptions, cron, VAPID, SW handler)
- `THREE_DAYS_MS` constant already exists in the job — the window was anticipated
- Directly addresses CLAUDE.md "scheduled payment reminders (closes revenue loop)"
- The existing deliverable "due today" alert is already too late — 3-day window gives creator time to prepare or send a reminder message to the brand
- Zero new infrastructure, no schema changes, pure logic extension

## Why Not Alternatives
- **Email reminders:** needs email provider, HTML templates, unsubscribe link — Phase 2
- **In-app banner:** creator must open app to see it; push is ambient
- **"Due today" only:** already in cron for deliverables, but payment "due today" not covered and 1 day is often too little notice

## User Without This
Creator has 8 active deals. Payment due in 2 days for a ₹80K deal. Creator only finds out it's overdue 4 days later when they happen to open the app. Brand has moved on. Awkward conversation.

## Success Criteria
- Push fires for payment/deliverable due in 1–3 days
- Creator receives push → opens deal → copies payment reminder → sends to brand before due date
- No duplicate notifications (idempotent per payment/deliverable per day)
- No amounts in push payload (SOT §25.2)

## Assumptions
- Creator has opted into push notifications in Settings
- 3-day window is the right lead time (matches existing overdue threshold constant)
- Upcoming items and overdue items share the MAX_NOTIFICATIONS_PER_USER=3 cap
