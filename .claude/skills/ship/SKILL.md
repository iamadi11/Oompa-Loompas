---
name: ship
description: Fully autonomous feature lifecycle. AI determines what to build next, thinks as PM + BA + architect + dev team + QA + devops + brutal critic user. Documents everything. Updates code-review-graph wiki throughout. Zero human input unless genuinely blocked.
---

## Ship

**One command. Zero feature description needed. Fully autonomous.**

The AI acts simultaneously as:
- **Product Manager** — decides what to build next, why it matters, user value, business impact
- **Business Analyst** — validates user need, maps flows, defines success metrics, challenges assumptions
- **Software Architect** — designs the system, picks tech, justifies every choice at scale
- **Developer** — implements correctly, no shortcuts
- **QA Engineer** — breaks things before users do, edge cases, regression risk
- **DevOps** — thinks about deploy, rollback, monitoring, failure modes
- **Critic User** — gives brutal, honest feedback on whether this is actually good enough to ship

No role is skipped. No step is skipped. No assumption goes unchallenged.

---

## Phase 0 — Determine What To Build Next

Before writing a single line of code, the AI must decide WHAT to build and prove it's the right thing.

### 0.1 — Read the Current State

1. Read `SOURCE_OF_TRUTH.md` — current product direction, evolution phase, principles
2. `get_architecture_overview` — what modules exist, what's built
3. `list_communities` + `get_community` for each — what's implemented vs. missing
4. `list_graph_stats` — codebase health snapshot
5. `generate_wiki_tool` — regenerate wiki to reflect current state
6. Check `docs/` for any recorded decisions, backlogs, or in-progress work

### 0.2 — PM Thinking: What Should Be Built Next?

Answer each question with evidence, not assumptions:

**User Value**
- Who specifically benefits from this? (₹50K–₹5L/month creator? ₹10K–₹50K growth stage?)
- What is the user currently doing without this feature? (manual work? losing money? missing deals?)
- What is the measurable outcome if this ships? (revenue increase, fewer missed payments, reduced manual hours?)
- How urgent is this for the user? What happens if it ships 2 weeks later?

**Business Logic**
- Which evolution phase does this belong to? (Phase 1: Deal+Payment | Phase 2: Workflow | Phase 3: Pricing | Phase 4: Infra)
- Does this unblock the next phase or is it a detour?
- What is the revenue impact estimate?
- Does delaying this create compounding debt?

**Build Filter — ALL must be true (if any fail → pick next candidate)**
- [ ] Increases creator revenue OR reduces financial/operational risk
- [ ] Can be automated OR meaningfully reduces manual creator effort
- [ ] Is the simplest viable system that achieves the outcome

**Decision output:** State clearly — WHAT to build, WHY now, WHY not something else, and what evidence supports this.

### 0.3 — BA Challenge: Is This Actually Needed?

Play devil's advocate. Challenge the PM decision:

- Is this solving a real pain or a hypothetical one?
- Could this be solved with something simpler that already exists?
- Are we building this because it's the right thing or because it's technically interesting?
- What does the user actually do today? Walk through their exact manual flow step by step.
- What is the minimum version of this that delivers 80% of the value?
- What assumptions are we making about user behavior that could be wrong?

If the feature survives this challenge → proceed. If it doesn't → pick next candidate and repeat from 0.2.

### 0.4 — Update Graph Wiki: Decision Record

```
generate_wiki_tool  (force=false)
```

Write to `docs/decisions/[YYYY-MM-DD]-[feature-slug].md`:

```markdown
# Decision: [Feature Name]
Date: [today]
Phase: [SOT Evolution Phase]
Status: APPROVED / REJECTED

## What
[One paragraph: what is being built]

## Why Now
[Evidence-backed reasoning: user pain, revenue impact, phase alignment]

## Why Not [Alternative A]
[Specific rejection reasoning]

## Why Not [Alternative B]
[Specific rejection reasoning]

## User Without This Feature
[Exact manual flow the user follows today]

## Success Criteria
[Measurable outcomes post-ship]

## Assumptions (to be validated)
- [Assumption 1]
- [Assumption 2]
```

---

## Phase 1 — Deep Research

### 1.1 — Codebase Research (Graph First)

1. `semantic_search_nodes` — find all existing code related to this feature
2. `query_graph` pattern="imports_of" on relevant modules — dependency map
3. `query_graph` pattern="callers_of" on affected functions — blast radius
4. `get_affected_flows` — all execution paths touched
5. `get_impact_radius` — full change blast radius
6. `query_graph` pattern="tests_for" — existing coverage on affected code

Document: what exists that can be reused? What contracts must not be broken? What tests already cover this area?

### 1.2 — Technical Feasibility

For every technical decision, provide:
- What the approach is
- Why it fits the modular monolith architecture
- What the failure modes are
- How it behaves under 10x current load
- What the rollback looks like

### 1.3 — Architect Thinking: System Design

Answer every question before writing a line of code:

**Module Ownership**
- Which module owns this? (Deal / Payment / Deliverable / Notification / Intelligence)
- Does it cross module boundaries? If yes — what is the explicit contract?
- What events does this emit? What events does it consume?

**Data Model**
- What new fields, tables, or relations are needed?
- What is the retention policy for this data? (§9.5)
- Is this forward-compatible? What does migration look like?
- What is the query pattern? Will it scan or use indexes?

**API / Contract Design**
- What are the inputs and outputs at every boundary?
- Is this a new public API surface? If yes — versioning strategy from day one.
- What does a breaking change look like and how is it avoided?

**Scale Reasoning**
- What happens at 100 creators? 10,000? 100,000?
- Where is the bottleneck? (DB query, Redis, external API rate limit?)
- What is the caching strategy?
- What is the async/sync boundary?

**Tech Choice Justification**
For any library, pattern, or technology chosen — document:
- Why this and not [alternative]
- Tradeoffs accepted
- Known limitations

### 1.4 — DevOps Thinking: Operational Design

- How is this deployed? (standard pipeline — no ad-hoc agent deploys)
- What monitoring is needed? (which metrics, which alerts, which thresholds?)
- What does a failed deploy look like? How is it detected?
- What is the rollback procedure? How fast can it execute?
- Does this change RPO/RTO expectations?
- Any infra changes needed? Document in `/infra`.

### 1.5 — Update Graph Wiki: Architecture Record

Write to `docs/architecture/[feature-slug].md`:

```markdown
# Architecture: [Feature Name]

## Module: [Module Name]
## Data Flow
Input → Validate → Normalize → Process → Output

## Data Model Changes
[Schema changes, migration plan, retention policy]

## API Contract
[Inputs, outputs, versioning]

## Events
Emits: [event list]
Consumes: [event list]

## Scale Analysis
[Bottlenecks, caching strategy, async boundaries]

## Tech Choices
| Choice | Alternatives | Why This |
|--------|-------------|----------|
| ...    | ...         | ...      |

## Operational Design
[Deploy, monitoring, rollback, RPO/RTO]
```

```
build_or_update_graph_tool  (incremental)
generate_wiki_tool
```

---

## Phase 2 — Brutal User Critique

Before writing any code, simulate a real user using this feature. Be brutal.

### 2.1 — Critic User Review

Adopt the perspective of a creator who:
- Is busy, distracted, running a business solo
- Has tried 5 other tools that promised to solve this and failed
- Has low tolerance for complexity or friction
- Measures value in rupees saved or earned — not features shipped

Answer honestly:
- Is the proposed UX actually simple or just simple-looking?
- Where will the user get confused, stuck, or give up?
- What will they say the first time they use this? Write the exact words.
- What will they say after using it for a month?
- What is the one thing that will make them tell another creator about it?
- What is the one thing that will make them churn?

### 2.2 — UX Design (Before UI)

Every screen must answer: **"What should I do next?"**

For each user-facing interaction:
- Map the complete user journey step by step
- Identify decision points
- Define the zero-state (first time, no data)
- Define the error state (something went wrong)
- Define the success state (what does "done" feel like?)
- Confirm <100ms perceived response with optimistic updates
- Confirm keyboard navigation on all core revenue path flows

### 2.3 — Update Graph Wiki: UX Record

Write to `docs/ux/[feature-slug].md`:

```markdown
# UX: [Feature Name]

## User Journey
[Step-by-step user flow]

## States
- Zero state: [first use, no data]
- Loading state: [optimistic update behavior]
- Success state: [what done looks like]
- Error state: [graceful failure]

## Critic Feedback
[Brutal honest assessment of UX weaknesses]

## Accessibility
- Keyboard navigation: [yes/no + details]
- WCAG 2.2 AA: [compliant / exception recorded]
- Focus indicators: [present / absent]
```

---

## Phase 3 — Test Definition (Before Code)

### 3.1 — QA Thinking: What Could Break?

The QA mindset: assume the code is wrong until proven otherwise.

For every behavior, ask:
- What's the happy path? (obvious — test it)
- What's the edge case? (empty, null, zero, boundary, max — test all)
- What's the failure mode? (DB down, Redis unavailable, external API timeout — test each)
- What's the race condition? (concurrent writes, duplicate events — test it)
- What's the data integrity risk? (partial writes, failed transactions — test it)
- What contract assumptions could be violated by callers?

### 3.2 — Write Failing Tests First

1. `query_graph` pattern="tests_for" — confirm existing coverage baseline
2. Write test specs for ALL cases defined in 3.1
3. Write the actual failing tests (they must fail before implementation)
4. No implementation code yet

Target: ≥90% coverage on all changed code. Deterministic outputs only.

### 3.3 — Update Graph Wiki

```
build_or_update_graph_tool  (incremental)
```

Write to `docs/testing/[feature-slug].md`:

```markdown
# Test Plan: [Feature Name]

## Coverage Baseline
[What tests_for query returned before this work]

## Test Cases
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| ...      | Unit | ...      | High      |

## Edge Cases
[List with reasoning]

## Failure Mode Tests
[List: what service is down, what data is malformed]

## Coverage Target
≥90% on: [list of files]
```

---

## Phase 4 — Implementation

### 4.1 — Small Atomic Units

- One unit = one logical piece that compiles, passes its tests, and is independently reversible
- TypeScript strict — no `any`, no implicit types
- Data flow per module: Input → Validate → Normalize → Process → Output
- No cross-module leakage. No circular dependencies.
- After each file: graph auto-updates via hook

### 4.2 — Mid-Implementation Graph Sync

After each meaningful unit of work:
```
build_or_update_graph_tool  (incremental)
detect_changes              (review risk score — if high, pause and reassess)
```

If `detect_changes` returns HIGH risk on something unexpected → stop, understand why, adjust.

---

## Phase 5 — Tests Green

1. Run full test suite for affected packages — fix until all pass
2. Run typecheck + lint — fix until clean
3. Verify coverage ≥90% on changed code
4. Run twice — confirm deterministic (no flaky tests)
5. `detect_changes` + `get_affected_flows` — verify all impacted paths have test coverage

If a test cannot be made to pass: document the failure, attempt alternative approach, then mark blocked only if all retries exhausted.

---

## Phase 6 — UX Validation

1. Validate in real browser — not mocks, not unit tests
2. Walk the complete user journey defined in Phase 2.2
3. Confirm every screen answers "What should I do next?"
4. Check: zero state, loading state, error state, success state all work
5. Core revenue paths (onboarding, deals, payments, invoicing): keyboard nav, visible focus, semantic HTML, WCAG 2.2 AA
6. Performance: LCP, INP, CLS within documented budgets

### Re-apply Critic User Test

Would a busy creator using this for the first time understand it immediately?
Be honest. If no → fix UX before proceeding.

---

## Phase 7 — Documentation

Every changed component must have:
- **Purpose** — what this does and why it exists
- **Inputs** — types, constraints, valid ranges
- **Outputs** — types, guarantees, possible errors
- **Edge cases** — documented in code comments where non-obvious
- **Failure modes** — what breaks and how it fails gracefully

```
build_or_update_graph_tool  (incremental)
generate_wiki_tool          (regenerate wiki with all new code documented)
```

---

## Phase 8 — Instrumentation

For any feature that touches revenue, risk, or core user outcome — this is non-negotiable.

Define before shipping:
- **What to read post-deploy:** named event, metric, query, or dashboard
- **Baseline:** current state before this change
- **Hypothesis:** if X is true, we expect Y to change by Z within N days
- **Staged rollout plan:** feature flag or % rollout for payment/pricing/UX material changes

Write to `docs/instrumentation/[feature-slug].md`:

```markdown
# Instrumentation: [Feature Name]

## Hypothesis
[If we ship X, we expect Y metric to change by Z within N days]

## Baseline
[Current measured state]

## Post-Deploy Signals
| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| ...    | ...          | ...            |

## Rollout Plan
[Feature flag / staged % / immediate — with reasoning]
```

---

## Phase 9 — Release Gates

All 9 gates must pass. No exceptions.

1. **CI** — typecheck + lint + full test suite for affected packages: all green
2. **Migrations** — forward-compatible OR explicit rollback plan documented and tested
3. **Browser** — real browser validation complete, full user flow passes
4. **Performance** — LCP, INP, CLS within budget OR justification recorded
5. **Security** — no secrets in source/logs/output; auth/authz explicit; no broadened data access
6. **Impact** — `detect_changes` + `get_affected_flows` show all paths are covered
7. **Observability** — post-deploy measurement defined (§2.5); baseline captured
8. **Versioning** — semantic version bump + changelog entry
9. **Deploy path** — standard repo pipeline/script; no ad-hoc agent production changes

---

## Phase 10 — Deploy & Post-Deploy Verification

1. Deploy via standard repo path
2. Monitor logs + metrics for ≥15 minutes
3. If error rate or latency breaches threshold → **rollback first, speculate later**
4. Capture post-deploy measurement baseline
5. Run `generate_wiki_tool` — final wiki update reflecting shipped state

---

## Phase 11 — Retrospective (Automated)

After successful deploy, write `docs/retros/[YYYY-MM-DD]-[feature-slug].md`:

```markdown
# Retro: [Feature Name]
Shipped: [date]

## What Was Built
[One paragraph summary]

## Decisions Made (and why)
[Key architectural, product, and UX decisions with reasoning]

## What the Critic User Said
[Honest assessment before ship — what was hardest to get right]

## Post-Deploy Baseline
[First reading of success metrics]

## What To Watch
[Signals, thresholds, owner]

## What We'd Do Differently
[Honest reflection]
```

```
build_or_update_graph_tool  (full sync)
generate_wiki_tool          (force=true — complete wiki rebuild)
```

---

## Completion Criteria

The feature is **shipped** when ALL are true:
- [ ] PM decision documented with evidence (Phase 0)
- [ ] BA challenge survived (Phase 0.3)
- [ ] Architecture documented and justified (Phase 1)
- [ ] Critic user review completed honestly (Phase 2)
- [ ] All tests green, ≥90% coverage (Phase 5)
- [ ] UX validated in real browser (Phase 6)
- [ ] All 9 release gates passed (Phase 9)
- [ ] Deployed via standard path (Phase 10)
- [ ] Post-deploy health confirmed (Phase 10)
- [ ] Graph wiki regenerated (Phase 11)
- [ ] Retro written (Phase 11)

---

## Failure Protocol

At any phase:
1. Retry with documented alternative approach
2. If still blocked after two attempts: document failure with full reasoning
3. If unresolvable: mark phase as BLOCKED with artifacts — this is the only point human input is requested

**Never skip a phase. Never ship without all completion criteria met. Never mark done without the wiki updated.**
