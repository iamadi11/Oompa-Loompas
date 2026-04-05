# SOURCE_OF_TRUTH.md

Version: 1.1.0
Status: Immutable (Core System Definition)
Last Updated: 2026-04-06

---

# 0. PREAMBLE

This document defines the **non-negotiable foundation** of the system.
It is not documentation — it is **decision authority**.

If any implementation, feature, or idea conflicts with this document:
→ **This document wins.**

---

# 1. CORE PHILOSOPHY

## 1.1 Product Vision

Build a **Creator Revenue Intelligence System** that:

* Maximizes creator income (primary objective)
* Eliminates revenue leakage
* Automates operational work
* Acts as a **decision-making system**, not a reporting tool

This product does NOT assist decisions.
→ It **makes and drives them**.

---

## 1.2 Product Definition

This is:

→ A **financial outcome engine for creators**

This is NOT:

* ❌ Dashboard
* ❌ CRM
* ❌ Task manager
* ❌ Analytics tool

---

## 1.3 Core Principles

1. **Outcome > Activity**

   * If it doesn’t increase revenue or reduce risk → it does not exist

2. **Automation > Input**

   * Users should not maintain the system

3. **Clarity > Power**

   * Simpler systems win over flexible ones

4. **System > Feature**

   * Build systems, not isolated capabilities

5. **Trust > Intelligence**

   * Deterministic correctness > “smart” behavior

---

## 1.4 Non-Negotiable Truths

* Every output must be:

  * explainable
  * testable
  * reversible

* No hidden logic

* No implicit assumptions

* No black-box decisions

---

# 2. PRODUCT DIRECTION

## 2.1 Core Capabilities

The system must:

### Capture

* Deals (email, integrations, manual fallback)
* Payment commitments
* Deliverables

### Understand

* Pricing patterns
* Client behavior
* Risk signals

### Act

* Recommend pricing
* Trigger follow-ups
* Detect delays
* Initiate workflows

### Execute

* Send reminders
* Generate invoices
* Track payments

---

## 2.2 Product Feel

The product should feel like:

→ A **personal business operator**

Not:

* software
* dashboard
* AI tool

---

## 2.3 Target Users

Primary:

* ₹50K – ₹5L/month creators

Secondary:

* ₹10K – ₹50K/month (growth stage)

---

## 2.4 Evolution Path

Phase 1 → Deal + Payment Intelligence
Phase 2 → Workflow Automation
Phase 3 → Pricing + Negotiation Intelligence
Phase 4 → Financial Infrastructure Layer

---

## 2.5 Outcome Validation & Instrumentation

Shipped work that targets **revenue, risk, or core user outcomes** MUST define how success is measured after deploy:

* stable **product or system signals** (named events, metrics, or queries) tied to the hypothesis — not vanity counts
* **baseline** or comparison path where practical before broad rollout
* **staged rollout or feature flags** for material UX, pricing, or payment-impacting changes when the stack supports them

Autonomous work MUST NOT treat an outcome-bearing feature as complete without documenting **what will be read post-deploy** and **where** (dashboard, query, pipeline, or event stream). Absent instrumentation, default to smallest measurable slice or explicit “learning milestone” in the research artifact (§6.3).

---

# 3. SYSTEM ARCHITECTURE

## 3.1 Architectural Decision

We use a **Modular Monolith inside a Monorepo**.

This is FINAL.

---

## 3.2 Why This Wins

* Maximum development speed
* Shared context across system
* Zero duplication of contracts
* Easier refactoring
* AI-agent friendly

---

## 3.3 Explicitly Rejected

| Approach         | Reason                         |
| ---------------- | ------------------------------ |
| Microservices    | Coordination overhead > value  |
| Polyrepo         | Context fragmentation          |
| Serverless-first | Debugging + determinism issues |

---

## 3.4 Repo Structure

/repo
/apps
/web
/api
/worker

/packages
/ui
/db
/types
/utils
/config

/infra
/docs

---

## 3.5 System Design

Architecture:

→ Modular Monolith
→ Event-Driven Internally

Modules:

* Deal
* Payment
* Deliverable
* Notification
* Intelligence

---

## 3.6 Data Flow (Strict)

Input → Validate → Normalize → Process → Output

No step may be skipped.

---

## 3.7 Design Rules

* Explicit contracts only
* Composition over inheritance
* No cross-module leakage
* No circular dependencies

---

## 3.8 Contract & API Evolution

* Boundaries between modules (HTTP handlers, workers, **internal events**) MUST use explicit schemas or types shared via packages; **breaking changes** require a migration path, data repair if needed, and in-repo notes for all consumers
* **Externally visible** HTTP or integration surfaces MUST follow a documented **versioning and deprecation** rule set (minimum: deprecation notice, sunset horizon, migration steps)
* Default posture: **additive** evolution; breaking changes only with coordinated release, major version where semver applies, or feature-flagged cutover

---

# 4. AI-DRIVEN DEVELOPMENT SYSTEM

## 4.1 Absolute Rules

No code is written without:

* Research
* Plan
* Test definition

---

## 4.2 Execution Constraints

* Only small, incremental changes
* Each change must:

  * compile
  * pass tests
  * be reversible

---

## 4.3 Validation Requirements

* Deterministic API responses
* UI tested in real browser
* Full user flow verified

---

# 5. TESTING & QUALITY

## 5.1 Standards

* ≥ 90% coverage
* Deterministic outputs only
* Edge cases required

---

## 5.2 Test Layers

* Unit
* Integration
* End-to-End

---

## 5.3 Bug Policy

Every bug MUST include:

* failing test
* fix
* regression protection

---

# 6. RESEARCH-FIRST DEVELOPMENT

## 6.1 Mandatory Before Build

* Technical feasibility
* UX validation
* Alternatives comparison

---

## 6.2 Hard Rule

No research → No development

---

## 6.3 Research Outputs (Required)

Before build, research MUST be captured in a structured artifact (issue, doc section, or agent handoff) that includes:

* stated assumptions and open questions
* primary sources or official docs for external APIs, libraries, and standards (with version or date)
* alternatives considered and why the chosen path is simplest viable (per §19.4)

---

## 6.4 Research Stopping Criteria

Research stops when:

* technical feasibility and main risks are documented
* the simplest viable approach is chosen (not the most complete exploration)
* further investigation has diminishing returns versus shipping a small validated increment

Endless research without a bounded artifact is forbidden.

---

# 7. UI/UX SYSTEM (CRITICAL)

## 7.1 Design Standard

Must feel:

* intentional
* premium
* human-crafted

Must NOT feel:

* generated
* templated
* cluttered

---

## 7.2 UX Rules

Every screen answers:

→ “What should happen next?”

---

## 7.3 Interaction Principles

* <100ms perceived response
* optimistic updates
* immediate feedback

---

## 7.4 Visual System

* strict typography hierarchy
* consistent spacing
* minimal color usage
* motion only when meaningful

---

## 7.5 UX Validation

* real browser testing mandatory
* real workflows only

---

## 7.6 Accessibility

* User-facing flows MUST target **WCAG 2.2 Level AA** unless a **scoped, time-bound exception** is recorded with owner and remediation plan
* Core revenue paths (onboarding, deals, payments, invoicing) MUST be **keyboard-operable**, with **visible focus**, semantic structure, and correct labels for forms and dynamic regions
* Automated accessibility checks SHOULD run in CI where the stack supports them; critical paths warrant manual verification in addition to browser UX checks (§7.5)

---

## 7.7 Performance Budgets

* **Core Web Vitals** (or an equivalent field/lab standard) for **representative pages** on **core revenue paths** MUST have **documented numeric budgets** — at minimum **LCP**, **INP** (interaction latency), and **CLS** — kept in-repo or under `/docs` and updated when app shells, routing, or global data-loading strategy changes
* Unless the project overrides in writing, **default to industry “good” thresholds** for those metrics on critical routes; **stricter** targets are encouraged for payment-adjacent and money-touching flows
* **JavaScript and critical asset budgets** (e.g. first-load or per-route chunks for `/apps/web`) MUST be defined; exceeding them requires **justification** in the change record (§12.3)
* **CI, bundle analysis, or synthetic checks** SHOULD enforce budgets on a **stable page list**; if tooling is not yet wired, **manual browser profiling** on that list is mandatory before merge for work that affects bundles, rendering, or fetch patterns on those paths
* §7.3 interaction targets **complement** but **do not replace** these budgets

---

## 7.8 Web client / PWA

* The **web client** is delivered as a **Progressive Web App (PWA)** where the platform supports installability: **Web App Manifest**, appropriate **icons** (including maskable-safe artwork), and **HTTPS** in production
* **Installability** MUST NOT regress **§7.6**: keyboard operation, visible focus, semantic structure, and assistive technology compatibility remain mandatory after install
* A **service worker** MAY be used for install criteria, **static asset precaching**, and an **offline shell**; it MUST NOT present **cached API or financial state as authoritative** when the network is unavailable
* **Revenue-bearing reads and writes** (deals, payments, deliverables, invoicing, balances) MUST use **network truth** when online; when offline, the product MUST show **deterministic, explicit messaging** (e.g. connection required) — no silent stale money data
* **Motion** MUST respect **prefers-reduced-motion**; transitions remain **short and purposeful** per §7.4 and MUST NOT harm **CLS** or focus management

---

# 8. MULTI-AGENT SYSTEM

## 8.1 Agents

* Planner
* Researcher
* Developer
* Tester
* Reviewer
* Optimizer

---

## 8.2 Rules

* No overlapping roles
* Strict I/O contracts
* Schema-defined communication only

---

# 9. TOOLING

## 9.1 Stack

* TypeScript (strict)
* Next.js (**web client shipped as a PWA** where the browser supports installability, per §7.8)
* Fastify
* PostgreSQL
* Redis

---

## 9.2 Standards

* Strict typing mandatory
* ESLint + Prettier enforced

---

## 9.3 Efficiency

* shared packages
* static analysis
* code graph tooling
* **code-review-graph MCP** — mandatory for agent context selection and review as specified in **§20.4** (reduces token use versus undirected search and full-file reads)

---

## 9.4 Security & Secrets (Autonomous Execution)

* secrets and production credentials MUST live only in environment, secret managers, or platform stores — never in source, prompts, logs, or agent transcripts
* dependency and supply-chain changes MUST use locked manifests where the stack supports them; high-risk upgrades require explicit verification
* authentication, authorization, and PII boundaries MUST be explicit in module contracts; agents MUST NOT broaden data access “for convenience”

---

## 9.5 Data Stewardship & Privacy

* Collect and retain the **minimum** data required for stated outcomes (§1.3); new fields or tables need a stated purpose
* **Retention and deletion** expectations MUST be documented per domain (e.g. deals, communications, billing artifacts); implement user- or law-driven deletion where applicable
* Processing MUST follow **applicable regulation and consent** requirements; agents MUST NOT infer consent, shorten retention, or bypass policy for velocity
* **Cross-border** or multi-region data handling MUST follow a strategy recorded in `/docs` or a dedicated policy — not invented task-by-task

---

# 10. OBSERVABILITY & IMPROVEMENT

## 10.1 Observability

* logs
* metrics
* tracing

---

## 10.2 Continuous Improvement

System must:

* detect inefficiencies
* suggest optimizations
* refactor safely

---

## 10.3 Backup & Recovery

* Production databases and irreplaceable state MUST have **automated backups** with **tested restore** on a defined cadence (documented with infra)
* **RPO** (maximum acceptable data loss) and **RTO** (maximum acceptable time to restore service) MUST be stated for the product and respected when designing migrations and runbooks
* Autonomous changes to persistence or failover paths MUST NOT violate documented RPO/RTO without explicit human approval (§22.3)

---

# 11. FAILURE MANAGEMENT

## 11.1 Failure Flow

1. Detect
2. Log
3. Diagnose
4. Fix
5. Validate

---

## 11.2 Retry Strategy

* exponential backoff
* capped retries

---

## 11.3 Rollbacks

* version-controlled
* data integrity verified

---

## 11.4 Escalation

Only when deterministic resolution fails

---

## 11.5 Customer-Impacting Incidents

When users, revenue, or payment integrity are materially affected:

* **Stabilize first** — mitigate, rollback, or feature-disable per §11.3 before extended diagnosis in production
* **Classify severity** and follow the org’s communication runbook for internal and (where required) user-facing updates
* **Blameless postmortem** after resolution: timeline, root cause, contributing factors, and **concrete prevention** (tests, monitors, guardrails, docs)
* Recurring regressions MUST link to §5.3 (failing test + fix + regression protection)

Detailed on-call rotations and templates MAY live outside this file; principles above are non-negotiable.

---

# 12. GOVERNANCE

## 12.1 Versioning

* Semantic versioning

---

## 12.2 Change Control

Core philosophy is:

→ Extremely difficult to change

---

## 12.3 Auditability

Every change must include:

* reason
* scope
* impact

---

# 13. SUCCESS METRICS

## 13.1 Product

* ↑ creator revenue
* ↓ missed payments

---

## 13.2 Engineering

* ≥90% coverage
* low regression rate

---

## 13.3 UX

* ≥95% task completion
* minimal friction

---

## 13.4 System

* ≥99.9% uptime
* <200ms latency

---

## 13.5 Performance & Front-End Health

* Engineering and UX success include **stable adherence** to §7.7 on core routes, alongside §13.3 and §13.4
* **Regressions** in lab or field performance against documented budgets are **quality defects**; repeated slips on the same surface MUST follow §5.3 (failing guardrail or test where possible, fix, regression protection)

---

# 14. ANTI-PATTERNS (FORBIDDEN)

* building without research
* implementing before test definition (§4.1, §16)
* large untested changes
* assumption-driven logic
* tight coupling
* premature scaling
* over-engineering
* shipping or merging to release branches without release gates (§22.1)
* secrets, tokens, or production credentials in source, logs, or agent output (§9.4)
* outcome-bearing features without defined post-deploy measurement (§2.5)
* breaking module or public contracts without migration, versioning, or documented deprecation (§3.8)
* core revenue paths shipped below the accessibility bar without a recorded exception (§7.6)
* expanding data collection, retention, or cross-border handling without alignment to §9.5
* merging web or client changes that **breach documented performance budgets** on core routes without recorded justification (§7.7)
* **routine exploration or code review** via undirected grep/glob or bulk file reads when the **code-review-graph** MCP is sufficient — wastes context and violates §20.4

---

# 15. DOCUMENTATION STANDARD

Every component must define:

* purpose
* inputs
* outputs
* edge cases
* failure modes

---

# 16. EXECUTION WORKFLOW (MANDATORY)

Aligned with §4.1: no implementation before research, plan, and **test definition**.

1. Research (per §6)
2. Plan (scope, approach, risks, rollback sketch if stateful)
3. **Define tests** — acceptance criteria, cases, and failure modes (tests may be written before or alongside code, but intent is fixed before merge)
4. Implement (small unit)
5. Run automated tests; fix until green
6. Validate UX (per §7.5, §7.6, and §7.7 when applicable)
7. Document (per §15)
8. For outcome-bearing work: confirm instrumentation or explicit learning milestone (§2.5)

---

# 17. SYSTEM CONSTRAINTS

## Allowed

* incremental improvements
* safe refactoring

---

## Forbidden

* breaking changes without migration
* undefined behavior
* silent failures

---

# 18. KNOWN WEAKNESSES

* monorepo growth complexity
* reliance on discipline
* agent boundary risks
* compliance and accessibility expectations increase review surface

---

## 18.1 Mitigation

* strict module boundaries
* enforced contracts
* automated checks
* CI for a11y, performance budgets, and security where feasible; explicit policies in §7.6, §7.7, §9.4, §9.5, §23

---

# 19. DECISION ENGINE (CRITICAL)

## 19.1 Priority Order (STRICT)

When conflicts arise, resolve in this order:

1. User Outcome (revenue impact)
2. System Determinism
3. Simplicity
4. Developer Velocity
5. Extensibility

Lower priority MUST yield to higher priority.

---

## 19.2 Tradeoff Rules

If forced to choose:

* Speed vs Correctness → Correctness
* Flexibility vs Simplicity → Simplicity
* Automation vs Control → Automation
* Intelligence vs Trust → Trust

---

## 19.3 Kill Criteria

A feature must be removed if:

* No measurable revenue impact within 2 iterations
* Increases cognitive load without outcome gain
* Introduces non-deterministic behavior

---

## 19.4 Build vs Reject Framework

Before building anything, ALL must be true:

1. Increases revenue or reduces risk
2. Can be automated or reduces manual effort
3. Is the simplest viable system

If any fail → reject or redesign

---

# 20. CONTEXT OPTIMIZATION SYSTEM

## 20.1 Principle

AI must NEVER read the entire codebase.

It must read:

→ only the minimal required context

---

## 20.2 Strategy

Use:

* structural code graphs
* dependency mapping
* change-based context selection

---

## 20.3 Rules

Context must be:

* minimal
* relevant
* deterministic

Full-repo reads are forbidden unless explicitly required

---

## 20.4 Code-review-graph MCP (mandatory)

For **all autonomous agents and AI-assisted engineering** in this repository:

* The **code-review-graph** MCP MUST be used **before** undirected exploration via bulk search (e.g. repo-wide grep), glob sweeps, or reading entire source files when the goal is to **understand structure, callers, impact, tests, or review changes**.
* **Rationale:** the graph returns **minimal, task-relevant context**, which **reduces tokens** in prompts and completions versus pulling large or unrelated files into context.
* **Fall back** to search or direct file reads **only** when the graph does not cover the needed symbol or path, or when the task explicitly requires a file the graph cannot satisfy (e.g. generated artifacts, config outside the graph, or human-specified paths).

Violation of this rule for routine exploration or review is **non-compliant** with §20.1–20.3.

---

# 21. AUTONOMOUS EXECUTION SYSTEM (CRITICAL)

## 21.1 Execution Model

Goal → Decompose → Plan → Execute → Validate → Iterate → Complete

No step may be skipped.

---

## 21.2 Task Decomposition

Planner agent MUST:

* break goals into atomic tasks
* define:

  * inputs
  * outputs
  * success criteria

Tasks must be:

* small
* testable
* independent

---

## 21.3 Orchestration Flow

1. Planner → creates task graph
2. Researcher → validates approach
3. Developer → implements
4. Tester → validates
5. Reviewer → ensures integrity
6. Optimizer → improves

---

## 21.4 State Management

System MUST maintain:

* task state
* execution history
* decisions made
* failures encountered

State must be:

* persistent
* structured
* queryable

---

## 21.5 Failure Handling (Autonomous)

If a task fails:

1. Retry with alternative approach
2. If failure persists:

   * escalate to Planner
   * re-evaluate approach
3. If unresolved:

   * mark blocked with reasoning

No silent failures allowed

---

## 21.6 Completion Criteria

A task is complete ONLY if:

* code compiles
* tests pass
* UX validated (including §7.6 and §7.7 for touched user-facing surfaces on core routes)
* no regressions introduced
* release gates satisfied when delivery includes production or release branches (§22.1)
* post-deploy measurement or milestone documented when the task materially affects revenue or risk (§2.5)

---

## 21.7 Safety Constraints

System MUST NOT:

* make large unverified changes
* bypass tests
* introduce non-deterministic behavior

---

## 21.8 Human Intervention Rule

Human input is ONLY allowed when:

* system is blocked after retries
* ambiguity cannot be resolved deterministically

Otherwise:

→ system must proceed autonomously

---

# 22. RELEASE & DELIVERY

Autonomous work is incomplete without a safe path to production.

## 22.1 Release Gates

Before a change is considered releasable:

* CI MUST pass: typecheck, lint, and the project’s test suite for affected packages
* database or schema migrations MUST be forward-compatible or accompanied by an explicit, reviewed rollback or repair plan
* user-facing changes MUST pass real-browser validation (§7.5) where they touch UI

## 22.2 Delivery Discipline

* version and changelog updates MUST follow semantic versioning (§12.1) and team conventions for tags or releases
* deploy using the repo’s standard path (script, pipeline, or platform); ad-hoc production changes from an agent without that path are forbidden
* after deploy: confirm health via observability (§10.1); if error rates or latency breach agreed thresholds, execute rollback (§11.3) before speculative fixes

## 22.3 Autonomy Boundary

Where organizational policy requires human approval (e.g. production credentials, legal sign-off, app store submission), the system MUST stop at a **blocked** state with reasoning and artifacts — not bypass the gate.

---

# 23. AI & AUTOMATION GOVERNANCE

Rules for **models and autonomous agents** in engineering and (where applicable) product automation.

## 23.1 Data & Models

* Customer or creator content from **production** MUST NOT be sent to external or unmanaged model providers for **training** unless explicitly permitted by contract and written policy
* Production data used for debugging or analysis through an LLM MUST follow **least privilege** and §9.4 / §9.5; broad exports or dumps are forbidden
* Prompts, tool outputs, or completions that may contain **PII or secrets** MUST NOT be written to general application logs or public artifacts; use redaction, structured logging, or policy-approved stores only

## 23.2 Operational Discipline

* Prefer **deterministic** verification (tests, types, linters, graphs) over repeated model calls for the same fact
* Where autonomous runs incur API cost, document or respect **budgets and ceilings** defined for the project; avoid unbounded retry loops
* In-product “intelligence” MUST remain explainable and testable per §1.4 — no silent model-only decisions on money or legal commitments without explicit human-gated policy

---

# FINAL DIRECTIVE

This is the **single source of truth**.

In case of ambiguity:

Default to:

* user outcome first
* deterministic behavior
* simplicity over complexity

Deviation is not allowed.

---

# DOCUMENT CHANGELOG

## 1.1.0 (2026-04-06)

* Added **§7.8 Web client / PWA**: installability, service worker boundaries, offline UX for revenue paths, motion and reduced-motion rules
* Clarified **§9.1 Stack**: Next.js web client is delivered as a PWA per §7.8

## 1.0.0 (2026-04-04)

* Initial immutable core system definition

---

END
