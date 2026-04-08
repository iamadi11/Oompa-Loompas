# Instrumentation: Shareable Deal Proposal Link

## Hypothesis
If creators can share proposals from within Oompa, negotiation round-trips shorten and deal NEGOTIATING→ACTIVE conversion improves.

## Baseline
No proposal sharing existed before 0.2.3.

## Post-Deploy Signals
| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| POST /api/v1/deals/:id/share calls | API logs | > 0 within 7 days of deploy |
| GET /api/v1/share/:token calls | API logs | Proportional to share calls |
| 404s on /api/v1/share/:token | API logs | Alert if > share calls (revoke working?) |

## Rollout Plan
Immediate — feature is additive, no data migration risk, revocable by design.
