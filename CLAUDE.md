# CLAUDE.md — AI Development Rules

> Derived from SOURCE_OF_TRUTH.md (v1.1.0, immutable).
> In any conflict: SOURCE_OF_TRUTH.md wins.
> This file governs ALL autonomous and AI-assisted work in this repository.

---

## 0. AUTHORITY

`SOURCE_OF_TRUTH.md` is the single decision authority for this project.
Read it before any ambiguous decision. Default to: **user outcome → determinism → simplicity**.

---

## 1. CONTEXT OPTIMIZATION (NON-NEGOTIABLE)

**ALWAYS use code-review-graph MCP BEFORE any file search or read.**

| Goal | Use |
|------|-----|
| Explore code / find symbols | `semantic_search_nodes` or `query_graph` |
| Understand change impact | `get_impact_radius` |
| Review a change | `detect_changes` + `get_review_context` |
| Trace callers/callees/tests | `query_graph` with pattern |
| Architecture overview | `get_architecture_overview` + `list_communities` |
| Execution paths | `get_affected_flows` |
| Renames / dead code | `refactor_tool` |

Fall back to Grep/Glob/Read **only** when the graph cannot satisfy the query (missing symbol, generated file, config outside graph, human-specified path).

**Full-repo reads are forbidden.** Never grep the entire repo when a graph query suffices.

---

## 2. MANDATORY EXECUTION WORKFLOW

Every implementation task MUST follow these steps in order. No step may be skipped.

```
1. RESEARCH   → technical feasibility, UX validation, alternatives (§6)
2. PLAN       → scope, approach, risks, rollback sketch if stateful
3. TEST FIRST → define acceptance criteria, cases, failure modes before writing code
4. IMPLEMENT  → small, incremental units only
5. TEST       → run automated tests; fix until green (≥90% coverage)
6. VALIDATE   → real browser for UI; full user flow for features
7. DOCUMENT   → purpose, inputs, outputs, edge cases, failure modes
8. INSTRUMENT → confirm post-deploy measurement or learning milestone for outcome-bearing work
```

**No research → no development.** If research is missing, do it first.

---

## 3. AUTONOMY RULES

- **Proceed without asking.** Only escalate to human when:
  1. Blocked after all retry approaches are exhausted
  2. Ambiguity genuinely cannot be resolved deterministically
  3. Organizational policy requires human approval (credentials, legal, app store)

- **On failure:** retry with alternative approach → escalate to planner → mark blocked with reasoning. No silent failures.

- **Small changes only.** Each change must: compile, pass tests, be reversible.

- **Priority order when conflicts arise:**
  1. User Outcome (revenue impact)
  2. System Determinism
  3. Simplicity
  4. Developer Velocity
  5. Extensibility

- **If forced to choose:** Speed vs Correctness → Correctness | Flexibility vs Simplicity → Simplicity | Automation vs Control → Automation | Intelligence vs Trust → Trust

---

## 4. ARCHITECTURE (FINAL — DO NOT DEVIATE)

- **Modular Monolith** inside a **Monorepo**. Not microservices, not polyrepo, not serverless-first.
- Modules: `Deal`, `Payment`, `Deliverable`, `Notification`, `Intelligence`
- Data flow: `Input → Validate → Normalize → Process → Output` — no step skipped
- **No cross-module leakage.** No circular dependencies.
- **Composition over inheritance.** Explicit contracts only.
- Breaking changes to module boundaries or public APIs require migration path + in-repo notes for all consumers.

```
/apps/web        → Next.js frontend
/apps/api        → Fastify backend
/apps/worker     → Background workers
/packages/ui     → Shared UI components
/packages/db     → Database layer
/packages/types  → Shared types
/packages/utils  → Shared utilities
/packages/config → Shared config
/infra           → Infrastructure
/docs            → Documentation
```

---

## 5. STACK & STANDARDS

- **TypeScript (strict mode mandatory)** — no `any`, no implicit types
- **Next.js** (web), **Fastify** (API), **PostgreSQL** (DB), **Redis** (cache/queue)
- **ESLint + Prettier enforced** — must pass before merge
- Shared types/contracts live in `/packages/types`; never duplicated across packages

---

## 6. TESTING REQUIREMENTS

- **≥90% coverage** — non-negotiable
- **Three layers required:** Unit → Integration → End-to-End
- **Deterministic outputs only** — no flaky tests
- **Edge cases required** — not optional
- **Every bug must include:** failing test + fix + regression protection (§5.3)
- Tests for a module must be checked via `query_graph pattern="tests_for"` before claiming coverage

---

## 7. RELEASE GATES (must all pass before merge/deploy)

1. CI passes: typecheck + lint + full test suite for affected packages
2. Database/schema migrations are forward-compatible OR have explicit rollback plan
3. User-facing changes pass real-browser validation (§7.5)
4. Outcome-bearing features have documented post-deploy measurement (§2.5)
5. Performance budgets on core routes not breached (§7.7) — or justification recorded
6. No secrets or credentials in source, logs, or agent output

---

## 8. SECURITY & SECRETS

- **Secrets live only in:** environment variables, secret managers, platform stores
- **Never in:** source code, prompts, logs, agent transcripts, CLAUDE.md
- Dependency changes use locked manifests; high-risk upgrades require explicit verification
- Auth, authorization, PII boundaries must be explicit in module contracts
- Agents must NOT broaden data access "for convenience"

---

## 9. ANTI-PATTERNS (FORBIDDEN — ZERO TOLERANCE)

Never do any of the following:

- Build without research first
- Implement before test definition
- Large untested changes (keep changes small and atomic)
- Assumption-driven logic (no hidden assumptions, no implicit state)
- Cross-module leakage or circular dependencies
- Secrets in source, logs, or output
- Full-repo grep/glob/read when code-review-graph suffices
- Outcome-bearing features without post-deploy measurement
- Breaking module contracts without migration + deprecation notice
- Core revenue paths shipped below WCAG 2.2 AA without recorded exception
- Merging web changes that breach documented performance budgets without justification
- Silent failures at any layer
- Non-deterministic behavior
- Force-pushing to main/master

---

## 10. UX RULES

- Every screen must answer: **"What should I do next?"**
- Perceived response: **<100ms** — use optimistic updates
- **WCAG 2.2 Level AA** on all user-facing flows; core revenue paths (onboarding, deals, payments, invoicing) must be keyboard-operable with visible focus
- Real browser testing is mandatory for UI changes — not optional
- The product must feel: intentional, premium, human-crafted — NOT generated or templated
- **Web / PWA (§7.8):** Installable web client with deterministic offline messaging for revenue paths; shell, motion, and reduced-motion rules in `docs/ux/web-shell-pwa.md` and `docs/architecture/pwa-web-client.md`

---

## 11. BUILD vs REJECT DECISION

Before building anything, ALL must be true:
1. Increases revenue OR reduces risk
2. Can be automated OR reduces manual effort
3. Is the simplest viable system

If any fail → reject or redesign. Do not build it.

**Kill a feature if:**
- No measurable revenue impact within 2 iterations
- Increases cognitive load without outcome gain
- Introduces non-deterministic behavior

---

## 12. DOCUMENTATION STANDARD

Every component must define in its documentation:
- Purpose
- Inputs
- Outputs
- Edge cases
- Failure modes

---

## 13. OBSERVABILITY

All outcome-bearing features require before shipping:
- Named events, metrics, or queries tied to the hypothesis
- Baseline or comparison path where practical
- Staged rollout or feature flags for payment/pricing/UX material changes

Post-deploy: confirm health via logs + metrics + tracing. If error rates or latency breach thresholds, execute rollback before speculative fixes.

---

## 14. MULTI-AGENT ROLES (NO OVERLAP)

| Agent | Responsibility |
|-------|---------------|
| Planner | Decomposes goals into atomic tasks; defines inputs, outputs, success criteria |
| Researcher | Validates technical feasibility; produces structured research artifact |
| Developer | Implements (small units only); runs tests until green |
| Tester | Validates test coverage; writes missing tests |
| Reviewer | Runs `detect_changes` + `get_review_context`; checks contracts and anti-patterns |
| Optimizer | Identifies inefficiencies; suggests and applies safe refactors |

Strict I/O contracts between agents. Schema-defined communication only.

---

## 15. DATA STEWARDSHIP

- Collect minimum data required for stated outcomes — new fields need a stated purpose
- Retention and deletion expectations must be documented per domain
- Do NOT infer consent, shorten retention, or bypass policy for velocity
- Cross-border data handling must follow a strategy recorded in `/docs`

---

## 16. CODE-REVIEW-GRAPH MCP TOOLS

| Tool | When to use |
|------|------------|
| `detect_changes` | Before any review — risk-scored change analysis |
| `get_review_context` | Source snippets for review — token-efficient |
| `get_impact_radius` | Before any refactor or breaking change |
| `get_affected_flows` | Which execution paths are impacted |
| `query_graph` | Callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Find functions/classes by name or keyword |
| `get_architecture_overview` | High-level codebase structure |
| `list_communities` | Major module breakdown |
| `refactor_tool` | Renames, dead code detection |
| `build_or_update_graph` | After bulk file changes |
| `list_graph_stats` | Verify graph is built and current |

The graph auto-updates via PostToolUse hook on Edit/Write/Bash.

---

## 17. HUMAN ESCALATION (LAST RESORT ONLY)

Only escalate when ALL of the following are true:
1. Tried at least two different approaches
2. Failure is documented with reasoning
3. Cannot be resolved deterministically from SOURCE_OF_TRUTH.md
4. Or: organizational policy explicitly requires human approval

In all other cases → **proceed autonomously**.
