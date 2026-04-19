# Instrumentation: Email/Text-to-Deal Capture

## Hypothesis
If creators can paste a brand email to pre-fill the deal form, deal creation time drops from ~5 min to <60 sec, and deals-created-per-week increases.

## Baseline
- Deal creation: manual entry only, ~5 min/deal estimated
- Deals created per week: measure from `deals` table before rollout (`SELECT date_trunc('week', created_at), count(*) FROM deals GROUP BY 1 ORDER BY 1`)

## Post-Deploy Signals

| Signal | Query / Location | Target |
|--------|-----------------|--------|
| Parser usage rate | count `deals` where `notes` contains parser hint keywords post-ship | >20% of new deals use parse flow within 2 weeks |
| Deal creation volume | `SELECT count(*) FROM deals WHERE created_at > deploy_date` vs prior 2 weeks | ≥10% increase |
| Form completion rate | E2E + manual: toggle opened → deal saved | >70% conversion once panel opened |

## Rollout Plan
Full rollout — UI-only, no data impact. Rollback: remove `ParseFromEmail` collapsible from `DealForm.tsx`. Zero migration required.
