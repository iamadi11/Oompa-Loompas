# Instrumentation: Deal CRUD

**Web shell & PWA:** [web-shell-pwa.md](../ux/web-shell-pwa.md) · [pwa instrumentation](./pwa-web-client.md)

## Hypothesis
If creators can record a deal in <60 seconds and view all active deals on one screen,
they will use this as their primary deal tracking tool within 7 days of onboarding.
Proxy metric: ≥1 deal created per active creator within 48 hours of sign-up.

## Baseline
Pre-ship: 0 deals in system (greenfield).

## Post-Deploy Signals

| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| deals.created (count/day) | Application logs → aggregate | <1/day after 7-day post-launch = low adoption signal |
| api /api/v1/deals p99 latency | Application logs → histogram | >500ms triggers investigation |
| api 5xx rate on /api/v1/deals/* | Application logs | >1% over 5 min → page oncall |
| deal status transitions per day | DB query: `SELECT status, COUNT(*) FROM deals GROUP BY status` | No change after 7 days = possible UX friction |
| POST /api/v1/deals 4xx rate | Application logs | >20% → indicates form validation UX problem |

## Post-Deploy Query (run at T+7 days)
```sql
-- How many deals were created and what is their status distribution?
SELECT
  status,
  COUNT(*) as count,
  AVG(value::numeric) as avg_value_inr
FROM deals
GROUP BY status
ORDER BY count DESC;

-- Adoption: creators with at least 1 deal
SELECT COUNT(DISTINCT brand_name) as unique_brands, COUNT(*) as total_deals
FROM deals
WHERE created_at > NOW() - INTERVAL '7 days';
```

## Rollout Plan
Immediate full rollout (Phase 1 MVP, no payment processing involved).
No feature flag needed — deal CRUD carries no financial risk.
If error rates spike post-deploy: roll back container, investigate before re-deploy.

## Learning Milestone
If at T+14 days, no deals have been created:
1. Check if API is reachable from web (CORS, DNS)
2. Check browser console for JS errors
3. Interview 1 creator who signed up but didn't create a deal
4. This milestone gates proceeding to Phase 2 (Payment tracking)
