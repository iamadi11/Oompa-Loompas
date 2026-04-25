# Instrumentation: Payment Follow-up Emails

## Hypothesis
Creators get auto follow-up emails 3d/7d/14d overdue → send more reminders within 24h → better payment collection rate within 30d of launch.

## Baseline (pre-launch)
- `payment_followup_emails` table rows: 0
- Payments RECEIVED within 7d of due date: measure from current DB
- `/api/v1/settings/notifications` `followupEmailsEnabled=false` count: 0 (not deployed)

## Post-deploy signals

| Signal | What to check | Target |
|--------|---------------|--------|
| Emails sent | `SELECT COUNT(*) FROM payment_followup_emails` | >0 within 24h of 07:30 UTC |
| Opt-out rate | `SELECT COUNT(*) FROM users WHERE followup_emails_enabled = false` | <20% in first 30 days |
| Payment conversion | Payments → RECEIVED within 7d of threshold email | >30% notified payments |
| 3d vs 14d distribution | `GROUP BY day_threshold` | Most hits at 3d (healthy) vs 14d (backlog) |
| Duplicate guard | Any (paymentId, dayThreshold) duplicate attempts | 0 dupes in logs |

## Rollout plan
No feature flag — new cron runs independently, no existing flow disrupted. Settings toggle defaults `true` (opt-out, matches `emailDigestEnabled` pattern). Monitor logs 07:30 UTC first two mornings post-deploy.