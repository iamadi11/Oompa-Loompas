# Instrumentation: Brand Profiles Frontend

## Hypothesis
If creators can view and edit brand contact info in-app, they will stop switching to phone contacts
or email threads for context, reducing deal management friction.

## Baseline (pre-ship)
- No brand profile views exist (feature not shipped)
- Brand directory visits: measure from server logs after ship

## Post-Deploy Signals
| Signal | Source | Target |
|--------|--------|--------|
| Profile page views (GET /deals/brands/:name) | API access log | >0 within 7 days |
| Profile saves (PUT /deals/brands/:name) | API access log | >10% of page views |
| Return visits to profile page | Server log session pattern | >1 visit/user within 14 days |

## Rollout
No feature flag needed — additive page, no payment/pricing change.
Monitor API logs for 404 spikes on /brands/:name (would indicate broken navigation).
