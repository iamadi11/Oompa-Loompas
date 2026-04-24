# Decision: Automated Payment Follow-up Emails

Date: 2026-04-25
Phase: 2 — Workflow Automation
Status: Approved

## What
When a payment crosses 3-day, 7-day, or 14-day overdue thresholds, send the creator a single triggered email with an escalating subject line and pre-composed reminder text they can forward to the brand. Each threshold fires once per payment — never repeats.

## Why Now
Phase 1.5 complete (push notifications, share sheet, install prompt, offline). Phase 2 automation is the next priority. The revenue chase loop has a manual gap at step 5: creator still has to decide when to escalate and what to say. This closes that gap with zero new infrastructure (Resend + daily cron pattern already exist from v0.5.4 email digest).

## Why Not Alternatives

| Alternative | Reason rejected |
|---|---|
| Auto-send email TO brand on creator's behalf | Requires brand email in every profile; raises deliverability/spam concerns; SOT §24.2 requires explicit confirmation |
| Daily digest enhancement | Digest already sends daily; threshold emails fire once at key urgency moments — different intent |
| BullMQ job queue | No advantage over daily cron for this use case; adds infra complexity |
| Push notification escalation | Push already handled (v0.5.1/v0.5.2); email is a different channel that persists |

## User Without This
Creator wakes up, opens daily digest, sees 5 overdue payments, doesn't know which ones have been nudged recently vs. which need a hard follow-up. Manually decides when to escalate. Misses the 7-day window where brands typically respond to urgency. 

## Success Criteria
- 3d/7d/14d threshold emails delivered to creator within 24h of threshold crossing
- Creator opens email and navigates to `/attention` or deal page (click-through)
- No duplicate sends: each threshold fires exactly once per payment
- Opt-out from settings works immediately (no further sends after opt-out)

## Assumptions
- Creator is likely to check email more carefully for a triggered alert than a daily summary
- 3d / 7d / 14d are the right thresholds (can adjust based on data post-launch)
- `emailDigestEnabled` is a sufficient proxy for "creator uses email notifications" — add separate `followupEmailsEnabled` toggle for granular control
