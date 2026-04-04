---
name: validate-release
description: Pre-merge and pre-release validation checklist per SOT §22.1 release gates
---

## Validate Release

Run this before any merge to main or production deployment.
All gates must pass. No exceptions, no skipping.

### Gate 1 — Code Quality

```bash
# In affected packages:
tsc --noEmit          # TypeScript — zero errors required
eslint .              # ESLint — zero errors required
prettier --check .    # Prettier — zero drift required
```

If any fail: fix before proceeding.

### Gate 2 — Tests

```bash
# Run full test suite for affected packages
pnpm test --filter=[affected-package]

# Verify coverage
pnpm test:coverage --filter=[affected-package]
```

Required:
- [ ] All tests pass
- [ ] Coverage ≥90% for changed code
- [ ] No flaky tests (run twice to confirm determinism)

### Gate 3 — Change Impact Analysis

1. `detect_changes` — get risk-scored analysis of all changes
2. `get_affected_flows` — confirm all impacted paths are tested
3. `get_impact_radius` on changed files — verify blast radius is understood
4. For each HIGH risk change: confirm explicit test coverage exists

### Gate 4 — Schema / Migration Safety

For any database changes:
- [ ] Migration is forward-compatible (old code works with new schema)
- [ ] OR explicit rollback plan is documented and tested
- [ ] Migration is idempotent where possible
- [ ] No data loss without explicit approval

### Gate 5 — UI Validation

For any user-facing changes:
- [ ] Tested in real browser (not just unit tests)
- [ ] Full user flow works end-to-end
- [ ] Core revenue paths (onboarding, deals, payments, invoicing): keyboard navigation works
- [ ] WCAG 2.2 AA: visible focus indicators, semantic HTML, labels on forms
- [ ] No regressions on other flows

### Gate 6 — Performance Budgets

For changes to `/apps/web` or routes in core revenue paths:
- [ ] LCP, INP, CLS within documented budgets
- [ ] JS bundle size within documented budget for affected routes
- [ ] If budget breached: justification recorded in change record

### Gate 7 — Security

- [ ] No secrets, tokens, or credentials in source code
- [ ] No secrets in logs, agent output, or commit history
- [ ] No new data collection without stated purpose (§9.5)
- [ ] Auth/authz boundaries are explicit — no broadened access

### Gate 8 — Observability (Outcome-Bearing Work)

For features that materially affect revenue, risk, or core user outcomes:
- [ ] Post-deploy measurement defined (named event, metric, query, or dashboard)
- [ ] Baseline or comparison path defined
- [ ] Staged rollout or feature flag in place for payment/pricing/UX changes

### Gate 9 — Deployment Path

- [ ] Deploying via repo's standard path (pipeline/script/platform)
- [ ] No ad-hoc production changes from agent without standard path
- [ ] Version and changelog updated (semantic versioning)
- [ ] Post-deploy health check plan defined (what to watch, rollback trigger)

### Rollback Readiness

Before deploying, confirm:
- [ ] Rollback command or procedure is documented
- [ ] Data integrity maintained if rollback is executed
- [ ] RPO/RTO expectations are met by rollback plan

### Post-Deploy Verification

After deployment:
1. Monitor logs + metrics for ≥15 minutes
2. Confirm no error rate or latency threshold breached
3. If thresholds breached → execute rollback BEFORE speculative fixes
4. Confirm post-deploy measurement baseline captured (for outcome-bearing work)

### If Any Gate Fails

Stop. Fix. Re-run from Gate 1.
Do not merge or deploy with failing gates.
Do not bypass gates to ship faster.
