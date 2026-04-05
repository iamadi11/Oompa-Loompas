---
name: implement-feature
description: Full lifecycle implementation of a feature per SOT §16 mandatory workflow
---

## Implement Feature

Execute the complete mandatory implementation workflow from SOURCE_OF_TRUTH.md §16.
No step may be skipped. No human input unless blocked after retries.

### Step 1 — Research (§6)

1. `semantic_search_nodes` — find existing code related to this feature
2. `get_architecture_overview` + `list_communities` — understand which module owns this
3. `query_graph` pattern="imports_of" — understand dependencies
4. Document in research artifact:
   - Stated assumptions and open questions
   - Primary sources / official docs (with version or date)
   - Alternatives considered and why chosen path is simplest viable
5. Verify: technical feasibility confirmed, main risks documented, simplest viable approach chosen

### Step 2 — Plan

1. Define: scope, approach, risks, rollback sketch (if stateful change)
2. `get_impact_radius` on files that will change — understand blast radius
3. `get_affected_flows` — identify impacted execution paths
4. Confirm: change fits within existing module boundaries (no cross-module leakage)
5. Define acceptance criteria: what does "done" look like?

### Step 3 — Test Definition (before writing code)

1. Write test cases covering:
   - Happy path
   - Edge cases (empty, null, boundary values)
   - Failure modes (what should break gracefully)
   - Contract: inputs → expected outputs
2. Check existing test coverage: `query_graph` pattern="tests_for" on affected files
3. Identify gaps — plan tests to fill them
4. Target: ≥90% coverage for changed code

### Step 4 — Implement

1. Work in small atomic units — each unit must compile on its own
2. Keep changes reversible
3. Follow data flow: Input → Validate → Normalize → Process → Output
4. No cross-module leakage. No circular dependencies.
5. TypeScript strict mode — no `any`, no implicit types
6. After each file change: graph auto-updates via hook

### Step 5 — Tests Green

1. Run full test suite for affected packages
2. Run typecheck + lint
3. Fix all failures before proceeding
4. Verify coverage ≥90% on changed code
5. `detect_changes` — review risk-scored change analysis

### Step 6 — Validate

1. For UI changes: validate in real browser, check full user flow
2. Verify every screen answers "What should I do next?"
3. For core revenue paths: confirm keyboard navigation, visible focus, WCAG 2.2 AA
4. For **`apps/web`** work touching shell, PWA, or global styles: follow `docs/ux/web-shell-pwa.md` and `docs/architecture/pwa-web-client.md`
5. For API changes: validate deterministic responses with real requests

### Step 7 — Document

Every changed component must have:
- Purpose
- Inputs
- Outputs
- Edge cases
- Failure modes

### Step 8 — Instrument (for outcome-bearing work)

1. Define what will be read post-deploy (event, metric, query, dashboard)
2. Define baseline or comparison path
3. If payment/pricing/UX material change: confirm feature flag or staged rollout is in place

### Completion Criteria

A task is ONLY complete when:
- [ ] Code compiles
- [ ] All tests pass (≥90% coverage)
- [ ] No regressions introduced
- [ ] UX validated in real browser (if UI touched)
- [ ] Post-deploy measurement documented (if outcome-bearing)
- [ ] Release gates satisfied (§22.1)
