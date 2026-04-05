# GEMINI.md — AI Development Rules

> Authority: SOURCE_OF_TRUTH.md (v1.1.0, immutable).
> Applies to: Gemini and all Google AI agents.
> In any conflict: SOURCE_OF_TRUTH.md wins.

---

## 0. CORE DIRECTIVE

You are operating on the **Creator Revenue Intelligence System** — a financial outcome engine for creators (₹50K–₹5L/month). This is NOT a dashboard, CRM, task manager, or analytics tool. It makes and drives decisions autonomously.

Every action must: increase revenue OR reduce risk. If neither → do not do it.

---

## 1. CONTEXT OPTIMIZATION (MANDATORY FIRST STEP)

**Use code-review-graph MCP BEFORE any file search or read.**

| Goal | Tool |
|------|------|
| Explore code / find symbols | `semantic_search_nodes` or `query_graph` |
| Understand change impact | `get_impact_radius` |
| Review a change | `detect_changes` + `get_review_context` |
| Trace callers/tests | `query_graph` with pattern |
| Architecture overview | `get_architecture_overview` + `list_communities` |

Fall back to file reads **only** when the graph cannot satisfy the query.
**Full-repo reads are forbidden.**

---

## 2. MANDATORY EXECUTION WORKFLOW (NO STEPS SKIPPED)

```
1. RESEARCH   → feasibility, alternatives, primary sources
2. PLAN       → scope, approach, risks, rollback sketch
3. TEST FIRST → define cases and failure modes before code
4. IMPLEMENT  → small atomic units only
5. TESTS GREEN → ≥90% coverage; fix until passing
6. VALIDATE   → real browser for UI; full user flow
7. DOCUMENT   → purpose, inputs, outputs, edge cases, failure modes
8. INSTRUMENT → post-deploy measurement for outcome-bearing work
```

**No research → No development.**

---

## 3. ARCHITECTURE (FINAL)

- **Modular Monolith, Monorepo** — not microservices, not polyrepo, not serverless-first
- Modules: `Deal`, `Payment`, `Deliverable`, `Notification`, `Intelligence`
- Data flow: `Input → Validate → Normalize → Process → Output`
- No cross-module leakage. No circular dependencies.

```
/apps/web   /apps/api   /apps/worker
/packages/ui  /packages/db  /packages/types  /packages/utils  /packages/config
/infra  /docs
```

---

## 4. STACK

TypeScript (strict) · Next.js · Fastify · PostgreSQL · Redis · ESLint + Prettier

**Web client:** PWA per SOURCE_OF_TRUTH §7.8 — see `docs/ux/web-shell-pwa.md` and `docs/architecture/pwa-web-client.md`.

---

## 5. TESTING

- ≥90% coverage — mandatory
- Unit + Integration + E2E
- Every bug: failing test + fix + regression protection
- Deterministic outputs only

---

## 6. DECISION PRIORITY

1. User Outcome (revenue) → 2. System Determinism → 3. Simplicity → 4. Dev Velocity → 5. Extensibility

---

## 7. BUILD FILTER (ALL MUST BE TRUE)

1. Increases revenue OR reduces risk
2. Can be automated OR reduces manual effort
3. Is the simplest viable system

If any fail → reject.

---

## 8. ANTI-PATTERNS (FORBIDDEN)

- Build without research
- Implement without test definition
- Large untested changes
- Cross-module leakage
- Secrets in source/logs/output
- Full-repo scan when graph suffices
- Silent failures
- Non-deterministic behavior

---

## 9. SECURITY

Secrets only in: environment, secret managers, platform stores.
Never in source, prompts, logs, or agent output.

---

## 10. AUTONOMY

Proceed without asking. Escalate to human ONLY when:
- Blocked after all retry approaches exhausted
- Ambiguity cannot be resolved from SOURCE_OF_TRUTH.md
- Policy explicitly requires human approval
