---
name: tdd
description: Test-driven development workflow — define and write tests before implementation per SOT §4.1 and §5
---

## TDD — Test-Driven Development

Tests must be defined BEFORE implementation. Intent is fixed before merge.
Target: ≥90% coverage. Deterministic outputs only. Edge cases required.

### Step 1 — Understand What Needs Testing

1. `semantic_search_nodes` — find the module/function to test
2. `query_graph` pattern="tests_for" — check existing test coverage
3. `query_graph` pattern="callees_of" — understand what this code calls (mock boundaries)
4. `query_graph` pattern="callers_of" — understand how this code is called (test entry points)
5. List the behaviors that need to be specified

### Step 2 — Define Test Cases (Before Code)

For each behavior, define:

```
GIVEN [initial state / inputs]
WHEN  [action / call]
THEN  [expected output / side effect / error]
```

Required categories:
- **Happy path** — expected inputs, expected outputs
- **Edge cases** — empty arrays, null values, zero amounts, boundary values, max lengths
- **Failure modes** — invalid inputs, missing data, external service down, DB error
- **Contract tests** — module boundary inputs/outputs match declared types
- **Regression tests** — for bugs being fixed: test that proves the bug exists, then fix it

### Step 3 — Write Tests First

1. Write test files with all defined cases (they will fail — that's correct)
2. Use TypeScript strict mode — no `any` in test code
3. Test file naming: `[module].test.ts` co-located or in `__tests__/`
4. Integration tests must hit real services (no mocks for DB integration tests — mocked tests that pass but prod fails is unacceptable)
5. Unit test mocks: mock only at explicit module boundaries

### Step 4 — Implement Until Green

1. Write minimum code to make each test pass
2. Do not add functionality not covered by a test
3. Run tests after each small unit of code
4. Fix failures immediately — never accumulate failing tests

### Step 5 — Coverage Check

1. Run coverage report for affected packages
2. Verify ≥90% on changed code
3. Identify uncovered lines — are they dead code or missing tests?
4. If dead code: flag for removal via `refactor_tool` mode="dead_code"
5. If missing tests: add them before proceeding

### Step 6 — Verify Test Quality

Tests must be:
- [ ] Deterministic — same result on every run
- [ ] Independent — no shared mutable state between tests
- [ ] Fast — unit tests <100ms each
- [ ] Descriptive — test name explains the scenario
- [ ] Covering edge cases — not just happy path

### Test Layers

**Unit Tests** (`/packages/*/src/**/*.test.ts`)
- Pure functions, service logic, utils
- Mock external dependencies at module boundaries
- Fast, no I/O

**Integration Tests** (`/apps/*/test/integration/**`)
- Module-to-module interactions
- Real database (test instance)
- Real Redis (test instance)
- Test full module contract

**End-to-End Tests** (`/apps/*/test/e2e/**`)
- Full user flows in real browser
- Core revenue paths: onboarding → deal → payment → invoice
- Must pass before any merge to main

### Bug Fix Protocol (§5.3)

Every bug fix MUST include:
1. Failing test that reproduces the bug (written first, must fail before fix)
2. The fix (minimum code to make test pass)
3. Regression protection (the test itself is the protection — never delete it)
