# Instrumentation: PWA Push Notifications

## Hypothesis
If creators are reminded via push notifications about 3+ day overdue payments, the average time between "overdue" and "paid" status will decrease by at least 24 hours within 14 days of feature adoption, reducing overall revenue leakage risk.

## Baseline
Current state: Zero push notifications sent. Creators return to the app ad-hoc to discover overdue payments. Time-to-resolution depends entirely on daily active use behavior.

## Post-Deploy Signals Table
| Signal | Type | Source | Threshold/Goal |
|---|---|---|---|
| `push_subscription_created` | Metric | DB `push_subscriptions` rows | 10% of active MAU ops-in within first 7 days |
| `push_notification_sent` | Event | API Cron info logs | Must be >0 during daily runs |
| `push_notification_failed` | Event | API Cron error logs | Error rate < 2% of total sends |
| Payment Status Transition | Query/Metric | DB `Payment` updates | Tracking median days overdue for paid transitions, comparing opted-in vs non-opted-in users. |

## Rollout Plan
1. Deploy schema additive changes (safe)
2. Deploy API endpoints (safe, isolated)
3. Deploy frontend setting + service worker updates (safe)
4. Enable cron job. The feature is self-gating since users must explicitly opt-in via `/settings/notifications`. No feature flag required.
