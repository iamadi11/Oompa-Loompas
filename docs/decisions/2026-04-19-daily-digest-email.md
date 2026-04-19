# Decision: Daily Digest Email

Date: 2026-04-19
Phase: Phase 2 — Workflow Automation (kickoff)
Status: APPROVED

## What

A daily digest email sent to each creator at 06:00 UTC (11:30 AM IST) listing:
- Overdue payments (with amounts and days overdue)
- Payments due in the next 3 days (with amounts)
- Deliverables due in the next 3 days

Each item deep-links to `/deals/:id`. Creators can opt out from `/settings`.
Sent via Resend. Silent no-op if `RESEND_API_KEY` is not configured.

## Why Now

Phase 1 is complete (v0.5.3). Push notifications (Phase 1.5) are live but require
explicit opt-in and browser permission — many creators haven't enabled them.
Email reaches everyone who registered. It's the highest-coverage notification channel.

Overdue payments are the single largest revenue leakage signal. An email that says
"₹75,000 from Nike is 5 days overdue" is harder to ignore than a badge on an app
the creator hasn't opened that day.

This is the simplest Phase 2 automation slice: no BullMQ, no new infrastructure beyond
Resend. Extends the existing `node-cron` pattern.

## Why Not BullMQ First

BullMQ is infrastructure without user-visible value by itself. The daily digest runs
once per day per user — identical pattern to the existing push notification cron.
`node-cron` is sufficient.

## Why Not Email Reminder Sequences

Sequences (7d before, 1d before, day-of, 3d after) require job scheduling per payment —
that's BullMQ territory. The daily digest gives 80% of the value: every overdue/due-soon
item surfaces every morning, regardless of how many payments the creator has.

## User Without This

Creator hasn't opened the app in 2 days. Zomato payment of ₹60,000 is now 4 days
overdue. Push notification fired once (2 days ago) but the creator swiped it away.
No re-alert until they open the app. Payment stays uncollected.

## Success Criteria

- Digest email delivered to all opted-in users with overdue or due-soon items
- Email contains correct amounts, brand names, deal deep-links
- Opt-out in settings disables digest for that user
- RESEND_API_KEY absent → cron runs silently, no error
- ≥1 overdue item required to trigger send (no empty digest emails)

## Assumptions

- Login email is a valid deliverable address
- Creators prefer 11:30 AM IST digest (workday context)
- Amounts in email are acceptable (email is end-to-end, not pushed through notification infra)
- Opt-out default is ON (transactional alert, not marketing)
