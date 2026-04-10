# Instrumentation: User Registration

## Hypothesis
If registration ships, we expect new User rows to appear in the DB within 24h of the first creator sharing the app URL, and the login→app conversion path to be validated by a real non-developer user.

## Baseline
Before ship: 0 self-registered users (all accounts are DB-seeded by developer).

## Post-Deploy Signals
| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| New User rows (self-registered) | DB: SELECT COUNT(*) FROM "User" WHERE "createdAt" > [deploy_time] | >0 within 48h of sharing URL |
| 409 rate | API logs: POST /register 409 responses | >5% of register attempts → investigate bot/duplicate |
| 400 rate | API logs: POST /register 400 responses | >20% → UX issue with form validation |

## Rollout Plan
Immediate — no feature flag. Registration is a greenfield route with no impact on existing authenticated users. Rollback is a 1-line route removal if critical issues found.
