# SOURCE_OF_TRUTH.md

Version: 1.3.0
Status: Immutable (Core System Definition — decisions immutable, formatting compressed for token efficiency)
Last Updated: 2026-04-11

---

# 0. PREAMBLE

This document is **decision authority**. Not documentation.

If any implementation, feature, or idea conflicts: **→ this document wins.**

---

# 1. CORE PHILOSOPHY

## 1.1 Product Vision

Build a **Creator Revenue Intelligence System** that:
* Maximizes creator income (primary objective)
* Eliminates revenue leakage
* Automates operational work
* Acts as a **decision-making system**, not a reporting tool

This product does NOT assist decisions. **→ It makes and drives them.**

## 1.2 Product Definition

→ A **financial outcome engine for creators**

NOT: ❌ Dashboard ❌ CRM ❌ Task manager ❌ Analytics tool

## 1.3 Core Principles

1. **Outcome > Activity** — if it doesn't increase revenue or reduce risk → it does not exist
2. **Automation > Input** — users should not maintain the system
3. **Clarity > Power** — simpler systems win over flexible ones
4. **System > Feature** — build systems, not isolated capabilities
5. **Trust > Intelligence** — deterministic correctness > "smart" behavior

## 1.4 Non-Negotiable Truths

Every output must be: explainable · testable · reversible. No hidden logic. No implicit assumptions. No black-box decisions.

---

# 2. PRODUCT DIRECTION

## 2.1 Core Capabilities

**Capture:** deals (email, integrations, manual fallback) · payment commitments · deliverables

**Understand:** pricing patterns · client behavior · risk signals

**Act:** recommend pricing · trigger follow-ups · detect delays · initiate workflows

**Execute:** send reminders · generate invoices · track payments

## 2.2 Product Feel

→ A **personal business operator**. Not software. Not a dashboard. Not an AI tool.

## 2.3 Target Users

Primary: ₹50K–₹5L/month creators. Secondary: ₹10K–₹50K/month (growth stage).

## 2.4 Evolution Path

**Phase 1 → Deal + Payment Intelligence** (current — completion in progress)
- Core shipped: Deal CRUD, payment milestones, deliverable tracking, dashboard, invoices, proposal links, pipeline strip, next-action prompt, deal duplication, portfolio CSV export (deals, payment milestones, deliverables, attention queue), brand directory (`/deals/brands`) with per-currency contracted totals + `?brandName=` filter on deal list, distinct brand suggestions on deal form (datalist)
- Remaining: email-to-deal capture, scheduled reminders, richer client profiles (contacts, notes, history beyond brand aggregates)

**Phase 1.5 → PWA + Engagement Layer** (overlaps Phase 1 completion)
- PWA push notifications for payment due alerts
- Offline read-only deal view
- Home screen install prompt
- System share sheet for reminder messages

**Phase 2 → Workflow Automation**
- BullMQ worker process + job scheduler
- Automated email reminder sequences
- Multi-user workspace (manager/team access)
- Payment reconciliation (bank match → deal)

**Phase 3 → Pricing + Negotiation Intelligence**
- Explainable rate floor (rules-first, history-required, never black-box)
- Brand payment behavior scoring
- Deal risk signals

**Phase 4 → Financial Infrastructure Layer**
- Payment processor integration
- Invoice-to-payment reconciliation
- Multi-currency conversion

## 2.5 Outcome Validation & Instrumentation

Shipped work targeting revenue, risk, or core user outcomes MUST define success measurement:
* Stable **product or system signals** (named events, metrics, or queries) tied to hypothesis — not vanity counts
* **Baseline** or comparison path where practical before broad rollout
* **Staged rollout or feature flags** for material UX, pricing, or payment-impacting changes

Autonomous work MUST NOT treat outcome-bearing features as complete without documenting **what will be read post-deploy** and **where**. Absent instrumentation → default to smallest measurable slice or explicit "learning milestone" in research artifact (§6.3).

---

# 3. SYSTEM ARCHITECTURE

## 3.1 Architectural Decision

**Modular Monolith inside a Monorepo.** FINAL.

Rejected alternatives:

| Approach | Reason |
|---|---|
| Microservices | Coordination overhead > value |
| Polyrepo | Context fragmentation |
| Serverless-first | Debugging + determinism issues |

## 3.2 Repo Structure

```
/apps/web · /apps/api
/packages/db · /packages/types · /packages/utils · /packages/config
/infra · /docs
```
Planned/optional: `/apps/worker` · `/packages/ui`

## 3.3 System Design

→ Modular Monolith → Event-Driven Internally

Modules: Deal · Payment · Deliverable · Notification · Intelligence

## 3.4 Data Flow (Strict)

`Input → Validate → Normalize → Process → Output` — no step may be skipped.

## 3.5 Design Rules

* Explicit contracts only · composition over inheritance · no cross-module leakage · no circular dependencies

## 3.6 Contract & API Evolution

* Module boundaries MUST use explicit schemas/types shared via packages; **breaking changes** require migration path, data repair if needed, and in-repo consumer notes
* Externally visible HTTP/integration surfaces MUST follow documented **versioning and deprecation** rules (minimum: deprecation notice, sunset horizon, migration steps)
* Default posture: **additive** evolution; breaking changes only with coordinated release, major version where semver applies, or feature-flagged cutover

---

# 4. AI-DRIVEN DEVELOPMENT SYSTEM

## 4.1 Absolute Rules

No code without: Research · Plan · Test definition.

## 4.2 Execution Constraints

Small, incremental changes only. Each change must compile · pass tests · be reversible.

## 4.3 Validation Requirements

Deterministic API responses · UI tested in real browser · full user flow verified.

---

# 5. TESTING & QUALITY

**Standards:** ≥90% coverage · deterministic outputs only · edge cases required

**Test Layers:** Unit · Integration · End-to-End

## 5.3 Bug Policy

Every bug MUST include: failing test · fix · regression protection.

---

# 6. RESEARCH-FIRST DEVELOPMENT

**Hard Rule:** No research → No development.

## 6.2–6.3 Research Outputs (Required)

Before build, research MUST produce structured artifact containing:
* Stated assumptions and open questions
* Primary sources or official docs (with version or date)
* Alternatives considered and why chosen path is simplest viable (per §19.4)

## 6.4 Research Stopping Criteria

Research stops when: technical feasibility + main risks documented · simplest viable approach chosen · further investigation has diminishing returns.

Endless research without a bounded artifact is forbidden.

---

# 7. UI/UX SYSTEM (CRITICAL)

## 7.1 Design Standard

Must feel: intentional · premium · human-crafted. Must NOT feel: generated · templated · cluttered.

## 7.2–7.3 UX Rules

Every screen answers: **"What should happen next?"** · <100ms perceived response · optimistic updates · immediate feedback.

## 7.4 Visual System

Strict typography hierarchy · consistent spacing · minimal color usage · motion only when meaningful.

## 7.5 UX Validation

Real browser testing mandatory. Real workflows only.

## 7.6 Accessibility

* User-facing flows MUST target **WCAG 2.2 Level AA** unless a scoped, time-bound exception is recorded with owner and remediation plan
* Core revenue paths (onboarding, deals, payments, invoicing) MUST be **keyboard-operable**, with **visible focus**, semantic structure, and correct labels
* Automated a11y checks SHOULD run in CI; critical paths warrant manual verification

## 7.7 Performance Budgets

* **Core Web Vitals** for representative pages on core revenue paths MUST have **documented numeric budgets** — minimum LCP, INP, CLS — kept in-repo or under `/docs`
* Default to industry "good" thresholds unless overridden; stricter targets encouraged for payment-adjacent flows
* **JS and critical asset budgets** MUST be defined; exceeding requires justification in change record (§12.3)
* CI/bundle analysis/synthetic checks SHOULD enforce budgets on stable page list; if not wired → manual browser profiling mandatory before merge for bundle/rendering changes

## 7.8 Web client / PWA

* Web client delivered as **Progressive Web App**: Web App Manifest · icons (including maskable-safe) · HTTPS in production
* Installability MUST NOT regress §7.6 (keyboard operation, focus, semantic structure, AT compatibility)
* Service worker MAY precache static assets and provide offline shell; MUST NOT present **cached API or financial state as authoritative** when network unavailable
* Revenue-bearing reads/writes MUST use **network truth** when online; when offline → **deterministic, explicit messaging** (e.g. connection required) — no silent stale money data
* Motion MUST respect `prefers-reduced-motion`; transitions short and purposeful; MUST NOT harm CLS or focus management

## 7.9 Motion System (Framer Motion)

* **Framer Motion** is canonical for `@oompa/web`. ALL motion MUST check `useReducedMotion()` with static fallback.
* Motion is **purposeful** — guide attention, signal state change, spatial orientation, or celebrate success. Never decorative. Never block interaction.
* Animation guidelines:
  * Page transitions: `initial={{ opacity: 0, y: 8 }}` → `animate={{ opacity: 1, y: 0 }}` 0.2s ease-out
  * Card/list: staggered fade-in `staggerChildren: 0.05s` — max 8 items staggered
  * State changes (success/error/loading): subtle scale + opacity 0.15s
  * Success celebrations: brief bounce or sparkle 0.4s non-blocking
  * Hover: scale 1.01–1.02, translateY -1px instant
  * Overlays/modals: fade + scale 0.96→1.0 0.2s
* MUST NOT harm CLS — no layout-affecting animations on initial paint
* All animations MUST be GPU-composited (transform/opacity only)

## 7.10 Conversion Design (Activation → Retention → Referral)

**Activation** (first deal created):
* New user: show deal type selector (sponsorship/affiliate/commission/other) before form — pre-fills relevant fields
* Smart defaults: payment due = 14 days · currency = INR · one suggested payment milestone
* After first deal: always show 3 next actions (send invoice, copy reminder, share proposal)
* Zero-state CTA must answer: "What kind of deal are you working on?" — not just "Add deal"

**Retention** (daily/weekly return):
* Home screen: time-sensitive signals first ("Payment due in 2 days" > static summary)
* Priority actions hyper-specific: brand name, amount, days overdue — not generic
* Daily value: at least one "done for you" action per session

**Referral** (organic growth):
* Celebrate payment received — brief animation + "₹X received on time"
* Shareable proposal link exposes brand to product
* Every invoice footer: "Generated by Oompa"

---

# 8. MULTI-AGENT SYSTEM

**Agents:** Planner · Researcher · Developer · Tester · Reviewer · Optimizer

**Rules:** No overlapping roles · strict I/O contracts · schema-defined communication only.

---

# 9. TOOLING

## 9.1 Stack

TypeScript (strict) · Next.js 16 (PWA per §7.8) · React 19 · **Framer Motion** (mandatory per §7.9) · Tailwind CSS · Fastify · PostgreSQL · Redis · Serwist · **BullMQ** (Phase 2 only)

**Standards:** Strict typing mandatory · ESLint + Prettier enforced.

## 9.3 Efficiency

Shared packages · static analysis · code graph tooling.

## 9.4 Security & Secrets (Autonomous Execution)

* Secrets/credentials MUST live only in environment, secret managers, or platform stores — never in source, prompts, logs, or agent transcripts
* Dependency changes MUST use locked manifests; high-risk upgrades require explicit verification
* Auth, authz, and PII boundaries MUST be explicit in module contracts; agents MUST NOT broaden data access "for convenience"

## 9.5 Data Stewardship & Privacy

* Collect and retain **minimum** data required for stated outcomes; new fields/tables need stated purpose
* Retention and deletion expectations MUST be documented per domain; implement user- or law-driven deletion where applicable
* Processing MUST follow applicable regulation and consent; agents MUST NOT infer consent or bypass policy for velocity
* Cross-border/multi-region data handling MUST follow strategy recorded in `/docs`

---

# 10. OBSERVABILITY & IMPROVEMENT

**Observability:** logs · metrics · tracing

**Continuous Improvement:** detect inefficiencies · suggest optimizations · refactor safely.

## 10.3 Backup & Recovery

* Production databases MUST have **automated backups** with **tested restore** on defined cadence
* **RPO** and **RTO** MUST be stated for the product; respected when designing migrations and runbooks
* Autonomous changes to persistence/failover paths MUST NOT violate documented RPO/RTO without explicit human approval (§22.3)

---

# 11. FAILURE MANAGEMENT

**Flow:** Detect → Log → Diagnose → Fix → Validate

**Retry:** exponential backoff · capped retries

**Rollbacks:** version-controlled · data integrity verified

**Escalation:** only when deterministic resolution fails

## 11.5 Customer-Impacting Incidents

* **Stabilize first** — mitigate, rollback, or feature-disable before extended production diagnosis
* **Classify severity** and follow communication runbook
* **Blameless postmortem:** timeline, root cause, contributing factors, concrete prevention
* Recurring regressions MUST link to §5.3

---

# 12. GOVERNANCE

**Versioning:** Semantic versioning.

**Change Control:** Core philosophy is extremely difficult to change.

## 12.3 Auditability

Every change must include: reason · scope · impact.

---

# 13. SUCCESS METRICS

| Category | Metric |
|---|---|
| Product | ↑ creator revenue · ↓ missed payments |
| Engineering | ≥90% coverage · low regression rate |
| UX | ≥95% task completion · minimal friction |
| System | ≥99.9% uptime · <200ms latency |

## 13.5 Performance & Front-End Health

Stable adherence to §7.7 on core routes. Regressions in lab/field performance = quality defects; repeated slips MUST follow §5.3.

---

# 14. ANTI-PATTERNS (FORBIDDEN)

* Building without research · implementing before test definition (§4.1, §16) · large untested changes
* Assumption-driven logic · tight coupling · premature scaling · over-engineering
* Shipping/merging to release branches without release gates (§22.1)
* Secrets, tokens, or credentials in source, logs, or agent output (§9.4)
* Outcome-bearing features without defined post-deploy measurement (§2.5)
* Breaking module or public contracts without migration/versioning/deprecation (§3.6)
* Core revenue paths below a11y bar without recorded exception (§7.6)
* Expanding data collection/retention/cross-border without alignment to §9.5
* Merging web changes that breach performance budgets without recorded justification (§7.7)
* Routine exploration via undirected bulk file reads when targeted search suffices

---

# 15. DOCUMENTATION STANDARD

Every component must define: purpose · inputs · outputs · edge cases · failure modes.

---

# 16. EXECUTION WORKFLOW (MANDATORY)

1. Research (per §6)
2. Plan (scope, approach, risks, rollback sketch if stateful)
3. **Define tests** — acceptance criteria, cases, failure modes (intent fixed before merge)
4. Implement (small unit)
5. Run automated tests; fix until green
6. Validate UX (per §7.5, §7.6, §7.7 when applicable)
7. Document (per §15)
8. For outcome-bearing work: confirm instrumentation or explicit learning milestone (§2.5)

---

# 17. SYSTEM CONSTRAINTS

**Allowed:** incremental improvements · safe refactoring

**Forbidden:** breaking changes without migration · undefined behavior · silent failures

---

# 18. KNOWN WEAKNESSES & MITIGATION

* Monorepo growth complexity · reliance on discipline · agent boundary risks · compliance/a11y review surface increases

**Mitigation:** strict module boundaries · enforced contracts · automated checks · CI for a11y/perf/security where feasible (§7.6, §7.7, §9.4, §9.5, §23)

---

# 19. DECISION ENGINE (CRITICAL)

## 19.1 Priority Order (STRICT)

1. User Outcome (revenue impact)
2. System Determinism
3. Simplicity
4. Developer Velocity
5. Extensibility

Lower priority MUST yield to higher priority.

## 19.2 Tradeoff Rules

* Speed vs Correctness → Correctness · Flexibility vs Simplicity → Simplicity · Automation vs Control → Automation · Intelligence vs Trust → Trust

## 19.3 Kill Criteria

Feature must be removed if: no measurable revenue impact within 2 iterations · increases cognitive load without outcome gain · introduces non-deterministic behavior.

## 19.4 Build vs Reject Framework

Before building, ALL must be true:
1. Increases revenue or reduces risk
2. Can be automated or reduces manual effort
3. Is the simplest viable system

If any fail → reject or redesign.

---

# 20. CONTEXT OPTIMIZATION SYSTEM

AI must NEVER read the entire codebase. Must read **only the minimal required context.**

Context must be: minimal · relevant · deterministic. Use targeted Grep/Glob before bulk file reads.

---

# 21. AUTONOMOUS EXECUTION SYSTEM (CRITICAL)

## 21.1 Execution Model

`Goal → Decompose → Plan → Execute → Validate → Iterate → Complete` — no step skipped.

## 21.2 Task Decomposition

Planner MUST break goals into atomic tasks with: inputs · outputs · success criteria. Tasks must be small · testable · independent.

## 21.3 Orchestration Flow

Planner → creates task graph → Researcher validates → Developer implements → Tester validates → Reviewer ensures integrity → Optimizer improves.

## 21.4 State Management

System MUST maintain: task state · execution history · decisions made · failures encountered. State must be: persistent · structured · queryable.

## 21.5 Failure Handling (Autonomous)

If task fails: (1) retry with alternative → (2) escalate to Planner, re-evaluate → (3) mark BLOCKED with reasoning. No silent failures.

## 21.6 Completion Criteria

Task complete ONLY if: code compiles · tests pass · UX validated (including §7.6 and §7.7 for touched user-facing surfaces) · no regressions · release gates satisfied (§22.1) · post-deploy measurement documented if revenue/risk affected (§2.5).

## 21.7 Safety Constraints

MUST NOT: make large unverified changes · bypass tests · introduce non-deterministic behavior.

## 21.8 Human Intervention Rule

Human input allowed ONLY when: system blocked after retries · ambiguity cannot be resolved deterministically. Otherwise → proceed autonomously.

---

# 22. RELEASE & DELIVERY

## 22.1 Release Gates

Before a change is releasable:
* CI MUST pass: typecheck, lint, test suite for affected packages
* DB/schema migrations MUST be forward-compatible or have explicit reviewed rollback/repair plan
* User-facing changes MUST pass real-browser validation (§7.5) where UI is touched

## 22.2 Delivery Discipline

* Version and changelog updates MUST follow semantic versioning (§12.1) and team conventions
* Deploy using repo's standard path (script, pipeline, or platform); ad-hoc production changes from agent without standard path are forbidden
* After deploy: confirm health via observability (§10); if error rates/latency breach thresholds → execute rollback (§11.3) before speculative fixes

## 22.3 Autonomy Boundary

Where organizational policy requires human approval (credentials, legal, app store) → system MUST stop at BLOCKED state with reasoning and artifacts.

---

# 23. AI & AUTOMATION GOVERNANCE

## 23.1 Data & Models

* Customer/creator content from **production** MUST NOT be sent to external/unmanaged model providers for training unless permitted by contract and written policy
* Production data for debugging via LLM MUST follow least privilege and §9.4/§9.5; broad exports/dumps forbidden
* Prompts, tool outputs, or completions containing **PII or secrets** MUST NOT be written to general application logs or public artifacts

## 23.2 Operational Discipline

* Prefer **deterministic** verification (tests, types, linters, graphs) over repeated model calls for same fact
* Where autonomous runs incur API cost, respect budgets/ceilings defined for project; avoid unbounded retry loops
* In-product "intelligence" MUST remain explainable and testable per §1.4 — no silent model-only decisions on money or legal commitments without explicit human-gated policy

---

# 24. IN-PRODUCT AI CAPABILITIES

AI features held to same standards as all features: explainable, testable, reversible (§1.4). "AI" is not an excuse for non-determinism.

## 24.1 Approved AI Capability Roadmap

| Phase | Capability | Data Required | Rule |
|---|---|---|---|
| Phase 2 | Smart reminder timing | Deal + payment history | Rules-based first (48h/24h/7d). LLM optional for copy only. |
| Phase 2 | Payment reconciliation v1 | Manual bank CSV upload | Match heuristic (amount + date ±3 days). Creator approves each match. |
| Phase 3 | Explainable rate floor | ≥12 historical deals | "Based on N past deals, your video rate is below median" — always cite data. |
| Phase 3 | Deal risk scoring | Brand payment history | Deterministic rule (avg days late + miss rate). Shown as label, not prediction. |
| Phase 4 | Email-to-deal capture | Forwarded email text | NLP extraction + creator review/confirm before save. Never auto-create. |

## 24.2 AI Governance (In-Product)

* Every AI-derived output shown to creator MUST be **labeled AI-suggested** and **cite the data it used**
* Creators MUST be able to **override or dismiss** any AI suggestion with one action
* AI MUST NOT auto-execute on deals, payments, or deliverables — always require **explicit creator confirmation**
* AI features touching money or contracts require **human-in-the-loop** before write operations
* No black-box pricing — every suggestion must show: "Based on [N] past deals, your average [type] rate is [₹X]. This deal is [Y]% below average."

## 24.3 What NOT to Build

* Black-box AI pricing without explainability · Auto-send reminders without explicit per-channel opt-in · AI modifying financial records without review · Predictive churn models (vanity metric) · ML trained on creator production data without written consent policy

---

# 25. PWA PUSH NOTIFICATIONS (Phase 1.5)

## 25.1 Approved Use Cases

| Trigger | Notification | Action |
|---|---|---|
| Payment due in 24h | "₹[X] due from [Brand] tomorrow" | Open deal → copy reminder |
| Payment 3+ days overdue | "[Brand] payment [N] days overdue" | Open deal → copy reminder |
| Deliverable due today | "[Title] due today for [Brand]" | Open deal → mark complete |

## 25.2 Rules

* Push notifications MUST be **opt-in** — creator explicitly enables in settings
* Notification copy MUST be **specific**: brand name, amount, days — never generic
* MUST NOT send more than **3 notifications per day** per creator
* On click: deep-link to relevant deal page, not home dashboard
* Notification payload MUST NOT include payment amounts or sensitive data in push body (privacy)
* Implement via **Web Push API** (Vapid keys) + service worker push event
* Unsubscribe accessible in one tap from notification and from settings

---

# FINAL DIRECTIVE

Single source of truth. In ambiguity: user outcome first · deterministic behavior · simplicity over complexity. Deviation not allowed.

---

# DOCUMENT CHANGELOG

## 1.3.0 (2026-04-11)
* Compressed formatting for token efficiency (~35% reduction in tokens); all decisions, section numbers, and content preserved

## 1.2.0 (2026-04-09)
* Added §7.9 Motion System, §7.10 Conversion Design, §24 In-Product AI Capabilities, §25 PWA Push Notifications
* Updated §2.4 Evolution Path, §9.1 Stack

## 1.1.1 (2026-04-08)
* Editorial: clarified §3.8 contract evolution, §7.6 accessibility bar

## 1.1.0 (2026-04-06)
* Added §7.8 Web client / PWA

## 1.0.0 (2026-04-04)
* Initial immutable core system definition

---
END
