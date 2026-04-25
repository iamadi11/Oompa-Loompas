# Instrumentation: Brand Payment Track Record

## Hypothesis
Creators who view brand profiles with ≥2 received payments will use payment timing data to negotiate better terms (earlier due dates, advance payment) on follow-on deals — measurable as reduced overdue rate per brand after the first profile view post-launch.

## Baseline (pre-launch)
- Overdue payment count: visible on /attention (no per-brand breakdown)
- No payment timing data surfaced anywhere
- Brand profile page visits: not yet instrumented

## Post-deploy signals

| Signal | Query / Source | Target |
|--------|---------------|--------|
| Brand profile pages with track record shown | `SELECT COUNT(*) FROM payments WHERE status='RECEIVED'` grouped by (userId, brandName) WHERE count > 0 | Proxy for pages showing the section |
| "Risky" brands identified | `SELECT COUNT(DISTINCT brandName) ...` where avgDays > 14 OR onTimeRate < 0.5 AND ≥2 payments | Shows how much signal exists in dataset |
| Overdue rate per brand (post-negotiation) | `SELECT brandName, COUNT(*) FROM payments WHERE status NOT IN ('RECEIVED','REFUNDED') AND dueDate < NOW()` | Should decrease for brands that were risky |

## Rollout
No feature flag needed — brand profile page was already gated behind auth; section only renders when `receivedPaymentsCount > 0`. No existing flow disrupted. Zero-state is hidden, so new users see no change.
