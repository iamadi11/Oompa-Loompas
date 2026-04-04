---
name: fix-bug
description: Systematic bug fix workflow per SOT §5.3 — failing test + fix + regression protection
---

## Fix Bug

Every bug fix requires: failing test → fix → regression protection. No exceptions.

### Step 1 — Reproduce and Understand

1. `semantic_search_nodes` — find the buggy code
2. `query_graph` pattern="callers_of" — trace where it's called from
3. `query_graph` pattern="callees_of" — trace what it calls
4. `detect_changes` — check if a recent change introduced this
5. `get_affected_flows` — find all execution paths through this code
6. Document: what is the incorrect behavior? what is the expected behavior?

### Step 2 — Write Failing Test First

BEFORE writing any fix:
1. Write a test that reproduces the bug
2. Run it — confirm it FAILS (proves the bug exists)
3. This test will become the regression protection

The test must:
- Be deterministic
- Capture the exact failure condition
- Assert the correct expected behavior

### Step 3 — Diagnose Root Cause

Do NOT fix symptoms — fix root causes.

1. Read the full execution path through the bug
2. Identify: is this a logic error, data error, contract violation, race condition, or missing validation?
3. Check: `get_impact_radius` — what else is affected by this bug?
4. Is the bug isolated or systemic?

For systemic bugs:
- Fix the root cause in one place
- Check all callers via `query_graph` pattern="callers_of"
- Apply consistent fix across all affected sites

### Step 4 — Implement the Fix

1. Write minimum code to make the failing test pass
2. Do not add unrelated changes
3. TypeScript strict mode — no `any`
4. Follow data flow: Input → Validate → Normalize → Process → Output
5. If the fix requires a contract change: document migration path for all consumers

### Step 5 — Verify Fix

1. Run the failing test — it must now pass
2. Run the full test suite for affected packages — no regressions
3. Run typecheck + lint — must pass
4. If UI-impacting: validate in real browser

### Step 6 — Regression Protection

The failing test written in Step 2 IS the regression protection. Verify:
- [ ] Test name clearly describes the bug scenario
- [ ] Test will catch any future regression of this exact bug
- [ ] Test is in the correct test layer (unit/integration/e2e)
- [ ] Test will run in CI automatically

### Step 7 — Document the Fix

In the code (if non-obvious logic):
- Why was this happening?
- What invariant was violated?
- Why this fix and not alternatives?

### Escalation

If bug cannot be reproduced deterministically → document the non-determinism and flag for human investigation.
If fix requires a breaking contract change → stop, document impact, escalate for coordinated release.
