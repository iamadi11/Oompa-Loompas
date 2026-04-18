# Instrumentation: Deliverable Approval Flow

## Hypothesis
Creators who share approval links will reduce back-and-forth DM approval time. If the feature is used, expect `brandApprovedAt` to be set within 24–72h of token generation on active deals.

## Baseline (2026-04-17)
- `brandApprovedAt` column: new, all NULL
- `approvalToken` column: new, all NULL
- No prior approval tracking in system

## Post-Deploy Signals

| Signal | Query / Source | Threshold |
|--------|---------------|-----------|
| Tokens generated | `SELECT COUNT(*) FROM deliverables WHERE approval_token IS NOT NULL` | >0 within 7 days |
| Approvals completed | `SELECT COUNT(*) FROM deliverables WHERE brand_approved_at IS NOT NULL` | >0 within 14 days |
| Approval funnel rate | `approved / tokens_generated` | target ≥30% within 30 days |
| Token revocations | `SELECT COUNT(*) FROM deliverables WHERE approval_token IS NULL AND brand_approved_at IS NULL AND updated_at > NOW() - interval '7 days'` | monitor for churn signal |

## Rollout Plan
- No feature flag — feature is additive, non-breaking
- Existing deliverables unaffected (all new columns nullable)
- Rollback: set `approvalToken = NULL, brandApprovedAt = NULL` for affected rows; revert API routes; revert web components
