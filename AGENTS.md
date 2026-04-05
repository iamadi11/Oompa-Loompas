# AGENTS.md — AI Agent Development Rules

> Authority: SOURCE_OF_TRUTH.md (v1.1.0, immutable).
> Applies to: all AI agents (Claude, GPT, Gemini, Cursor, Windsurf, OpenCode, custom agents).
> In any conflict: SOURCE_OF_TRUTH.md wins.

---

## 0. CORE DIRECTIVE

You are operating as an autonomous AI agent on the **Creator Revenue Intelligence System**.
This is a **financial outcome engine for creators** — not a dashboard, CRM, task manager, or analytics tool.

Every action you take must:
- Increase revenue OR reduce risk (if neither → do not do it)
- Be deterministic, explainable, testable, reversible
- Follow the mandatory execution workflow without skipping steps

---

## 1. MANDATORY EXECUTION WORKFLOW (NO STEPS SKIPPED)

```
1. RESEARCH   → Document technical feasibility, alternatives considered, primary sources
2. PLAN       → Scope, approach, risks, rollback sketch
3. TEST FIRST → Define acceptance criteria and failure modes before writing code
4. IMPLEMENT  → Small atomic units only; each must compile, pass tests, be reversible
5. TEST RUN   → All tests green; ≥90% coverage; fix until passing
6. VALIDATE   → Real browser for UI; full user flow for features
7. DOCUMENT   → Purpose, inputs, outputs, edge cases, failure modes
8. INSTRUMENT → Post-deploy measurement or explicit learning milestone
```

**Hard rule:** No research → No development. No test definition → No implementation.

---

## 2. CONTEXT OPTIMIZATION (MANDATORY)

Before any file search or read, use the **code-review-graph MCP**:

- Exploring code → `semantic_search_nodes` or `query_graph`
- Understanding impact → `get_impact_radius`
- Reviewing changes → `detect_changes` + `get_review_context`
- Finding callers/tests → `query_graph` with `callers_of` / `tests_for`
- Architecture → `get_architecture_overview` + `list_communities`

Only fall back to file reads when the graph cannot satisfy the query.
**Full-repo grep/glob/read sweeps are forbidden** unless the graph is insufficient.

---

## 3. ARCHITECTURE (FINAL)

- **Modular Monolith, Monorepo** — no microservices, no polyrepo, no serverless-first
- Modules: `Deal`, `Payment`, `Deliverable`, `Notification`, `Intelligence`
- Data flow: `Input → Validate → Normalize → Process → Output` — no step skipped
- No cross-module leakage. No circular dependencies. Composition over inheritance.
- Breaking contract changes require migration path + deprecation notice.

Repo layout:
```
/apps/web        Next.js frontend
/apps/api        Fastify API
/apps/worker     Background workers
/packages/ui     Shared UI
/packages/db     Database
/packages/types  Shared types
/packages/utils  Utilities
/packages/config Config
/infra           Infrastructure
/docs            Documentation
```

---

## 4. STACK

- TypeScript (strict) — no `any`, no implicit types
- Next.js / Fastify / PostgreSQL / Redis
- ESLint + Prettier enforced

---

## 5. TESTING

- ≥90% coverage — mandatory
- Layers: Unit + Integration + End-to-End
- Every bug: failing test + fix + regression protection
- Deterministic outputs only — no flaky tests

---

## 6. RELEASE GATES

A change is releasable ONLY when:
1. CI passes: typecheck + lint + tests for affected packages
2. Schema migrations are forward-compatible or have rollback plan
3. UI changes pass real-browser validation
4. Post-deploy measurement documented for outcome-bearing work
5. No secrets in source, logs, or agent output

---

## 7. DECISION PRIORITY (STRICT ORDER)

1. User Outcome (revenue impact)
2. System Determinism
3. Simplicity
4. Developer Velocity
5. Extensibility

When forced to choose:
- Speed vs Correctness → **Correctness**
- Flexibility vs Simplicity → **Simplicity**
- Automation vs Control → **Automation**
- Intelligence vs Trust → **Trust**

---

## 8. BUILD vs REJECT

Before building, ALL must be true:
1. Increases revenue OR reduces risk
2. Can be automated OR reduces manual effort
3. Is the simplest viable system

If any fail → **reject or redesign**.

---

## 9. ANTI-PATTERNS (ZERO TOLERANCE)

- Build without research
- Implement before test definition
- Large untested changes
- Assumption-driven logic
- Cross-module leakage
- Secrets in source/logs/output
- Full-repo scan when graph suffices
- Outcome features without post-deploy measurement
- Breaking contracts without migration
- Silent failures
- Non-deterministic behavior

---

## 10. SECURITY

- Secrets only in: environment, secret managers, platform stores
- Never in source, prompts, logs, agent transcripts
- Auth/authz/PII boundaries must be explicit in module contracts

---

## 11. AGENT ROLES (NO OVERLAP)

| Agent | Owns |
|-------|------|
| Planner | Goal decomposition, task graph, I/O contracts |
| Researcher | Feasibility, alternatives, structured research artifact |
| Developer | Small-unit implementation, green tests |
| Tester | Coverage validation, missing test authoring |
| Reviewer | Risk analysis, contract checks, anti-pattern detection |
| Optimizer | Safe refactors, dead code, performance |

---

## 12. AUTONOMY

- Proceed without human input unless blocked after retries OR policy requires approval
- On task failure: retry with alternative → escalate to planner → mark blocked with reasoning
- No silent failures. Document all decisions made.
- Human escalation is a last resort, not a first response

---

## 13. UX RULES

- Every screen answers: "What should I do next?"
- <100ms perceived response with optimistic updates
- WCAG 2.2 Level AA on all user-facing flows
- Core revenue paths (onboarding, deals, payments, invoicing): keyboard-operable, visible focus
- Real browser testing mandatory for UI changes
- **Web / PWA (§7.8):** Follow `docs/ux/web-shell-pwa.md` and `docs/architecture/pwa-web-client.md` for installability, offline shell, and network-truth rules for money paths

---

## 14. OBSERVABILITY

Before shipping outcome-bearing work:
- Named events/metrics/queries tied to hypothesis
- Baseline defined
- Staged rollout or feature flags for payment/pricing/UX changes

Post-deploy: verify via observability. Rollback before speculative fixes if thresholds breached.
