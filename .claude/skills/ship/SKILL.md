---
name: ship
description: Fully autonomous feature lifecycle. AI acts as PM+BA+architect+dev+QA+devops+critic. Documents everything. Zero human input unless blocked.
---

## Ship

**One command. Fully autonomous. AI decides what to build + executes end-to-end.**

No role skipped. No step skipped. No assumption unchallenged.

---

## Phase 0 — What To Build

### 0.1 — Read State
1. Read `SOURCE_OF_TRUTH.md`
2. Check `docs/` for in-progress decisions
3. Read `CHANGELOG.md` for current version + shipped features

### 0.2 — PM Decision
Answer with evidence:
- Who benefits · what they do manually without this · measurable outcome
- Which SOT phase? Unblocks next phase or detour?
- Build filter (ALL must pass): revenue/risk ↑ · automates/reduces effort · simplest viable

**Output:** WHAT · WHY NOW · WHY NOT alternatives · supporting evidence

### 0.3 — BA Challenge
- Real pain or hypothetical? · Simpler existing solution? · Technically interesting vs actually needed?
- Exact user manual flow today · Minimum version for 80% value · Assumptions that could be wrong

Survives challenge → proceed. Doesn't → pick next candidate, repeat 0.2.

### 0.4 — Decision Record
Write `docs/decisions/[YYYY-MM-DD]-[slug].md`:
```
# Decision: [Feature]
Date/Phase/Status
## What / Why Now / Why Not [Alt] / User Without This / Success Criteria / Assumptions
```

---

## Phase 1 — Research

### 1.1 — Codebase Research
Use Grep/Glob to find existing related code, callers, tests for affected modules.

Document: reusable code · contracts not to break · existing coverage

### 1.2 — Architecture
- Module ownership (Deal/Payment/Deliverable/Notification/Intelligence)
- New fields/tables/relations + migration + retention policy (§9.5)
- API inputs/outputs + versioning if public surface
- Scale bottleneck at 10K creators? Caching strategy? Async/sync boundary?
- Tech choice: why this vs alternatives, tradeoffs accepted

### 1.3 — DevOps
- Deploy path · monitoring (metrics/alerts/thresholds) · rollback procedure · RPO/RTO impact

### 1.4 — Architecture Record
Write `docs/architecture/[slug].md`:
```
# Architecture: [Feature]
Module / Data Flow / Schema changes + migration / API contract / Events / Scale / Tech choices / Ops
```

---

## Phase 2 — Critic User Review

### 2.1 — Brutal Critique
Persona: solo creator, measures value in rupees earned/saved, low tolerance for friction.
- UX actually simple or just simple-looking?
- Where will user get confused, stuck, give up?
- First-use reaction? After a month? What makes them churn vs refer?

### 2.2 — UX Design
Every screen: **"What should I do next?"**
- Map user journey · decision points · zero/error/success states
- <100ms perceived response · optimistic updates
- Keyboard nav on revenue paths · WCAG 2.2 AA
- `apps/web` → align with `docs/ux/web-shell-pwa.md` + `docs/architecture/pwa-web-client.md`

### 2.3 — UX Record
Write `docs/ux/[slug].md`:
```
# UX: [Feature]
Journey / zero·loading·success·error states / Critic feedback / A11y status
```

---

## Phase 3 — Tests First

### 3.1 — Test Cases
For every behavior:
- Happy path · edge cases (empty/null/zero/boundary/max) · failure modes (DB down, timeout, race) · data integrity

### 3.2 — Write Failing Tests
Write all specs → run → confirm FAIL (proves intent). No implementation yet.
Target: ≥90% coverage. Deterministic. No mocks for DB integration tests.

### 3.3 — Test Record
Write `docs/testing/[slug].md`:
```
# Test Plan: [Feature]
Coverage baseline / Test cases table / Edge cases / Failure modes / Coverage target (≥90%)
```

---

## Phase 4 — Implement

- Small atomic units: one logical piece, compiles, tests pass, independently reversible
- TypeScript strict — no `any`, no implicit types
- Data flow: Input → Validate → Normalize → Process → Output
- No cross-module leakage. No circular deps.

After each meaningful unit: run tests, confirm no regressions.

---

## Phase 5 — Tests Green

1. Full test suite → all pass
2. `pnpm typecheck` + `pnpm lint` → clean
3. Coverage ≥90% on changed code
4. Run twice → deterministic (no flaky)
5. **Invoke `simplify` skill** → review implementation for reuse, quality, efficiency; fix issues found

If test cannot pass: document, try alternative, mark BLOCKED only after all retries exhausted.

---

## Phase 6 — UX Validation

1. Real browser — not mocks
2. Walk complete user journey from Phase 2.2
3. Every screen: "What should I do next?"
4. Zero · loading · error · success states all work
5. Revenue paths: keyboard nav · visible focus · semantic HTML · WCAG 2.2 AA
6. LCP · INP · CLS within documented budgets
7. PWA shell changed → production build + manifest/SW checks per `docs/testing/pwa-web-client.md`

**Re-apply critic test:** busy creator, first use — understand immediately? No → fix UX first.

---

## Phase 7 — Documentation

Every changed component: purpose · inputs · outputs · edge cases · failure modes

---

## Phase 8 — Instrumentation

Outcome-bearing features (revenue/risk/core UX) — non-negotiable:
- What to read post-deploy: named event/metric/query/dashboard
- Baseline: current measured state
- Hypothesis: if X, expect Y to change by Z within N days
- Staged rollout: feature flag / % for payment/pricing/UX changes

Write `docs/instrumentation/[slug].md`:
```
# Instrumentation: [Feature]
Hypothesis / Baseline / Post-deploy signals table / Rollout plan
```

---

## Phase 9 — Release Gates

All 9 must pass:

1. **CI** — typecheck + lint + tests: all green
2. **Migrations** — forward-compatible OR rollback documented + tested
3. **Browser** — real browser validation complete
4. **Performance** — LCP/INP/CLS within budget OR justification recorded
5. **Security** — no secrets; auth/authz explicit; no broadened data access
6. **Observability** — post-deploy measurement defined + baseline captured
7. **Versioning** — semantic version bump + CHANGELOG entry
8. **Deploy path** — standard pipeline/script only; no ad-hoc agent production changes

Use **`caveman-commit`** skill for all git commit messages.

---

## Phase 10 — Deploy + Verify

1. Deploy via standard repo path
2. Monitor logs + metrics ≥15 min
3. Error rate or latency breach → **rollback first, speculate later**
4. Capture post-deploy measurement baseline

---

## Phase 11 — Retro

Write `docs/retros/[YYYY-MM-DD]-[slug].md`:
```
# Retro: [Feature]
What built / Decisions + why / Critic feedback / Post-deploy baseline / What to watch / What to do differently
```

Invoke **`compress`** skill on `docs/` memory files to reduce future context load.

---

## Completion Criteria

- [ ] PM decision documented with evidence (Ph 0)
- [ ] BA challenge survived (Ph 0.3)
- [ ] Architecture documented (Ph 1)
- [ ] Critic user review completed (Ph 2)
- [ ] Tests green ≥90% (Ph 5)
- [ ] `simplify` review passed (Ph 5)
- [ ] UX validated in browser (Ph 6)
- [ ] All 8 release gates passed (Ph 9)
- [ ] Deployed + health confirmed (Ph 10)
- [ ] Retro written + `compress` run (Ph 11)

---

## Failure Protocol

1. Retry with documented alternative approach
2. Still blocked → document failure with full reasoning
3. Unresolvable → mark BLOCKED with artifacts — only point human input requested

**Never skip a phase. Never ship without all criteria met. Never mark done without wiki updated.**
