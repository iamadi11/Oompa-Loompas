# AGENTS.md — AI Agent Development Rules
> Authority: SOURCE_OF_TRUTH.md (v1.3.0). Applies to: all AI agents (Claude, GPT, Gemini, Cursor, Windsurf, OpenCode, custom). SOT wins all conflicts.

---

## 0. CORE DIRECTIVE

Operating on the **Creator Revenue Intelligence System** — a **financial outcome engine for creators**. Not a dashboard, CRM, task manager, or analytics tool.

Every action must: increase revenue OR reduce risk · be deterministic, explainable, testable, reversible · follow mandatory execution workflow without skipping steps.

---

## 1. MANDATORY EXECUTION WORKFLOW (NO STEPS SKIPPED)

```
1. RESEARCH   → feasibility, alternatives, primary sources
2. PLAN       → scope, approach, risks, rollback sketch
3. TEST FIRST → acceptance criteria + failure modes before code
4. IMPLEMENT  → small atomic units; each compiles + passes tests + reversible
5. TEST RUN   → all green; ≥90% coverage; invoke simplify
6. VALIDATE   → real browser for UI; full user flow
7. DOCUMENT   → purpose, inputs, outputs, edge cases, failure modes
8. INSTRUMENT → post-deploy measurement or learning milestone
```

No research → No development. No test definition → No implementation.

---

## 2. CONTEXT OPTIMIZATION (MANDATORY)

Use **code-review-graph MCP** before any file search/read:

| Goal | Tool |
|---|---|
| Explore code | `semantic_search_nodes` / `query_graph` |
| Impact | `get_impact_radius` |
| Review | `detect_changes` + `get_review_context` |
| Callers/tests | `query_graph` callers_of / tests_for |
| Architecture | `get_architecture_overview` + `list_communities` |

Fall back to file reads only when graph cannot satisfy query. **Full-repo grep/glob/read sweeps are forbidden** unless graph is insufficient.

---

## 3. ARCHITECTURE (FINAL)

- **Modular Monolith, Monorepo** — no microservices, no polyrepo, no serverless-first
- Modules: `Deal` · `Payment` · `Deliverable` · `Notification` · `Intelligence`
- Data flow: `Input → Validate → Normalize → Process → Output` — no step skipped
- No cross-module leakage · no circular dependencies · composition over inheritance
- Breaking contract changes require migration path + deprecation notice

```
/apps/web (Next.js) · /apps/api (Fastify) · /apps/worker (Phase 2)
/packages/db · /packages/types · /packages/utils · /packages/config
```

---

## 4. STACK & STANDARDS

TypeScript strict (no `any`) · Next.js / Fastify / PostgreSQL / Redis · ESLint + Prettier enforced

---

## 5. TESTING

≥90% coverage mandatory · Unit + Integration + E2E · Every bug: failing test + fix + regression protection · Deterministic only.

---

## 6. RELEASE GATES

Change is releasable ONLY when:
1. CI: typecheck + lint + tests for affected packages
2. Schema migrations forward-compatible or rollback plan documented
3. UI changes pass real-browser validation
4. Post-deploy measurement documented for outcome-bearing work
5. No secrets in source, logs, or agent output

---

## 7. DECISION PRIORITY (STRICT)

User Outcome > System Determinism > Simplicity > Developer Velocity > Extensibility

* Speed vs Correctness → **Correctness** · Flexibility vs Simplicity → **Simplicity** · Automation vs Control → **Automation** · Intelligence vs Trust → **Trust**

---

## 8. BUILD vs REJECT

ALL must be true: increases revenue OR reduces risk · automates OR reduces manual effort · simplest viable system. Any fail → **reject or redesign**.

---

## 9. ANTI-PATTERNS (ZERO TOLERANCE)

Build without research · implement before test definition · large untested changes · assumption-driven logic · cross-module leakage · secrets in source/logs/output · full-repo scan when graph suffices · outcome features without post-deploy measurement · breaking contracts without migration · silent failures · non-deterministic behavior

---

## 10. SECURITY

Secrets only in: environment, secret managers, platform stores. Never in source, prompts, logs, agent transcripts. Auth/authz/PII boundaries must be explicit in module contracts.

---

## 11. AGENT ROLES

| Agent | Owns |
|---|---|
| Planner | Goal decomposition, task graph, I/O contracts |
| Researcher | Feasibility, alternatives, structured research artifact |
| Developer | Small-unit implementation, green tests |
| Tester | Coverage validation, missing test authoring |
| Reviewer | Risk analysis, contract checks, anti-pattern detection |
| Optimizer | Safe refactors, dead code, performance |

---

## 12. AUTONOMY

Proceed without human input unless blocked after retries OR policy requires approval. On failure: retry with alternative → escalate to planner → mark BLOCKED with reasoning. No silent failures. Document all decisions.

---

## 13. UX RULES

Every screen: "What should I do next?" · <100ms perceived response · WCAG 2.2 AA · revenue paths keyboard-operable + visible focus · real browser testing mandatory · `apps/web` → follow `docs/ux/web-shell-pwa.md` + `docs/architecture/pwa-web-client.md`

---

## 14. OBSERVABILITY

Before shipping outcome-bearing work: named events/metrics/queries tied to hypothesis · baseline defined · staged rollout for payment/pricing/UX changes. Post-deploy: verify via observability; rollback before speculative fixes if thresholds breached.
