# Instrumentation: Payment Follow-up Emails

## Hypothesis
If creators receive automated follow-up emails at 3d/7d/14d overdue, they will send more payment reminders within 24h of receiving the email, resulting in measurable improvement in payment collection rate within 30 days of launch.

## Baseline (pre-launch)
- `payment_followup_emails` table rows: 0
- Payments marked RECEIVED within 7 days of due date: measure from current DB state
- `/api/v1/settings/notifications` `followupEmailsEnabled=false` count: 0 (feature not deployed)

## Post-deploy signals

| Signal | What to check | Target |
|--------|---------------|--------|
| Emails sent | `SELECT COUNT(*) FROM payment_followup_emails` | >0 within 24h of 07:30 UTC |
| Opt-out rate | `SELECT COUNT(*) FROM users WHERE followup_emails_enabled = false` | <20% in first 30 days |
| Payment conversion | Payments moved to RECEIVED within 7d of threshold email | >30% of notified payments |
| 3d vs 14d distribution | `GROUP BY day_threshold` | Most hits at 3d (healthy) vs 14d (backlog) |
| Duplicate guard | Any (paymentId, dayThreshold) duplicate attempts | 0 duplicates in logs |

## Rollout plan
No feature flag needed — new cron job runs independently, no existing flow disrupted. Settings toggle defaults to `true` (opt-out model, matches existing `emailDigestEnabled` pattern). Monitor logs at 07:30 UTC first two mornings post-deploy for errors.
