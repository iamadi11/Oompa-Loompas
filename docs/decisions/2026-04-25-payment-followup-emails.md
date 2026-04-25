# Decision: Automated Payment Follow-up Emails

Date: 2026-04-25
Phase: 2 — Workflow Automation
Status: Approved

## What
Payment crosses 3d/7d/14d overdue → send creator triggered email. Escalating subject + pre-composed reminder text to forward to brand. Each threshold fires once per payment. No repeats.

## Why Now
Phase 1.5 done. Phase 2 automation next. Revenue chase loop has manual gap at step 5: creator must decide when to escalate + what to say. This closes gap. Zero new infra (Resend + daily cron already exist from v0.5.4).

## Why Not Alternatives

| Alternative | Reason rejected |
|---|---|
| Auto-send email TO brand on creator's behalf | Requires brand email in every profile; raises deliverability/spam concerns; SOT §24.2 requires explicit confirmation |
| Daily digest enhancement | Digest already sends daily; threshold emails fire once at key urgency moments — different intent |
| BullMQ job queue | No advantage over daily cron for this use case; adds infra complexity |
| Push notification escalation | Push already handled (v0.5.1/v0.5.2); email is a different channel that persists |

## User Without This
Creator sees 5 overdue payments in digest. Doesn't know which need escalation. Manually decides. Misses 7d window where brands respond to urgency.

## Success Criteria
- 3d/7d/14d threshold emails delivered within 24h of crossing
- Creator opens → navigates to `/attention` or deal page
- No duplicate sends: each threshold fires exactly once per payment
- Opt-out works immediately

## Assumptions
- Creator checks triggered alert more carefully than daily summary
- 3d/7d/14d are right thresholds (adjust post-launch)
- `emailDigestEnabled` sufficient proxy for email notifications — add separate `followupEmailsEnabled` toggle for granular control