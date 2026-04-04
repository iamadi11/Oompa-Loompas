# SOURCE_OF_TRUTH.md
Version: 1.0.0
Status: Immutable (Core System Definition)
Last Updated: 2026-04-04

---

# 1. CORE PHILOSOPHY

## 1.1 Product Vision
Build a **Revenue Intelligence System for Creators** that:
- Increases creator income
- Prevents revenue leakage
- Automates operational overhead
- Evolves into a financial + negotiation + intelligence layer

NOT a dashboard.
NOT a passive tracking tool.

This system must:
→ Actively influence outcomes  
→ Generate measurable financial impact  

---

## 1.2 Company Principles

1. **Outcome > Activity**
   - Only build features that directly improve user outcomes

2. **Automation > Input**
   - Minimize manual data entry
   - Maximize system inference

3. **Intelligence > Interface**
   - Value comes from decisions, not UI

4. **Systems > Features**
   - Build composable systems, not isolated features

5. **Determinism > Creativity**
   - All outputs must be reproducible and testable

---

## 1.3 Engineering Philosophy

- Prefer **simple systems that scale** over complex systems that break
- Build **modular monolith first**, evolve to services only when required
- Optimize for:
  - Maintainability
  - Observability
  - Testability

---

## 1.4 AI-First Constraints

- Every decision must be:
  - Explicit
  - Documented
  - Reproducible

- No hidden logic
- No implicit assumptions
- All flows must be executable by AI agents

---

# 2. PRODUCT DIRECTION

## 2.1 What We Are Building

A system that:
- Captures deal data automatically
- Tracks payments and obligations
- Provides actionable intelligence:
  - pricing suggestions
  - negotiation assistance
  - risk detection
- Automates reminders and enforcement

---

## 2.2 What We Are NOT Building

- Generic CRM
- Generic task manager
- Generic dashboard
- Social media management tool
- Content scheduling tool

---

## 2.3 Target Users

Primary:
- Professional creators earning ₹50K–₹5L/month

Secondary:
- Growing creators (₹10K–₹50K/month)

---

## 2.4 Evolution Path

Phase 1:
→ Deal + Payment Intelligence Core

Phase 2:
→ Automated capture + invoice + payment workflows

Phase 3:
→ AI negotiation + pricing engine

Phase 4:
→ Creator financial infrastructure layer

---

# 3. AI-DRIVEN DEVELOPMENT SYSTEM

## 3.1 Development Rules

MANDATORY:

- Test-Driven Development (TDD)
- No implementation without:
  - research
  - design
  - test cases

Each task must include:
- input
- output
- expected behavior

---

## 3.2 Execution Rules

- Only small, atomic changes allowed
- Each change must:
  - compile
  - pass tests
  - not break existing functionality

---

## 3.3 Validation Rules

- Code must execute successfully
- APIs must return deterministic outputs
- UI must be tested in browser environment
- Full user journey must be validated

---

# 4. ARCHITECTURE & DESIGN

## 4.1 Architecture Pattern

- Modular Monolith (Phase 1)
- Event-driven internal communication

Modules:
- User
- Deal
- Payment
- Deliverable
- Notification
- Intelligence

---

## 4.2 Design Principles

- SOLID
- DRY
- Composition over inheritance

---

## 4.3 Data Flow

Input Sources:
- Manual input
- Email parsing
- External integrations

Processing:
- Validation layer
- Normalization layer
- Business logic layer

Output:
- Notifications
- Insights
- UI rendering

---

## 4.4 Interfaces & Contracts

Each module must expose:
- Input schema
- Output schema
- Error states

No implicit data sharing allowed.

---

# 5. TESTING & QUALITY

## 5.1 Test Types

- Unit Tests (logic validation)
- Integration Tests (module interaction)
- End-to-End Tests (user journey)

---

## 5.2 Requirements

- 90%+ test coverage mandatory
- Edge cases must be explicitly tested
- Deterministic outputs required

---

## 5.3 Regression Prevention

- All bugs must include:
  - reproduction test
  - fix validation

---

# 6. RESEARCH-FIRST DEVELOPMENT

Before ANY development:

## 6.1 Required Research

- Technical feasibility
- UX patterns
- Existing solutions
- Tradeoffs

---

## 6.2 Decision Framework

For each decision:
- Option A vs B vs C
- Pros / Cons
- Final selection with reasoning

---

## 6.3 Constraint

If research is incomplete:
→ Development is BLOCKED

---

# 7. UI/UX PRINCIPLES

## 7.1 Design Standards

- Minimal
- High clarity
- No unnecessary elements

---

## 7.2 Rules

- No generic AI-style UI
- No clutter
- No hidden actions

---

## 7.3 Requirements

- Fully responsive
- Accessible (WCAG compliant)
- Keyboard navigable

---

## 7.4 Validation

- Must be tested in browser
- Must validate real flows:
  - add deal
  - track payment
  - resolve overdue

---

# 8. MULTI-AGENT SYSTEM DESIGN

## 8.1 Agents

1. Planner
2. Researcher
3. Developer
4. Tester
5. Reviewer
6. Optimizer

---

## 8.2 Responsibilities

Planner:
→ defines task breakdown

Researcher:
→ validates approach

Developer:
→ implements logic

Tester:
→ validates correctness

Reviewer:
→ enforces standards

Optimizer:
→ improves efficiency

---

## 8.3 Rules

- No overlapping responsibilities
- Agents communicate via defined contracts
- No shared mutable state without schema

---

# 9. TOOLING & EFFICIENCY

## 9.1 Standards

- TypeScript required
- Strict typing enforced
- ESLint + Prettier mandatory

---

## 9.2 Dependencies

- Must be:
  - actively maintained
  - widely adopted
  - minimal

---

## 9.3 Efficiency Tools

- Code graph systems
- Static analysis tools
- Automated testing pipelines

---

# 10. CONTINUOUS IMPROVEMENT SYSTEM

## 10.1 System Behavior

- Detect inefficiencies
- Suggest improvements
- Refactor safely

---

## 10.2 Feedback Loop

Input:
- logs
- errors
- performance metrics

Output:
- improvements
- optimizations

---

## 10.3 Observability

- Logging (structured)
- Metrics (latency, errors)
- Monitoring (uptime)

---

# 11. FAILURE HANDLING SYSTEM

## 11.1 Failure Types

- System failure
- Logic failure
- Data inconsistency

---

## 11.2 Response Strategy

1. Detect
2. Log
3. Identify root cause
4. Apply fix
5. Validate

---

## 11.3 Retry Logic

- Exponential backoff
- Max retry limit

---

## 11.4 Rollback

- Version-based rollback
- Data integrity checks

---

## 11.5 Escalation

Only when:
- deterministic fix not possible

---

# 12. GOVERNANCE & VERSIONING

## 12.1 Version Control

- Semantic versioning

---

## 12.2 Change Rules

Core sections:
→ Require explicit approval

Non-core:
→ Can evolve

---

## 12.3 Audit

- All changes logged
- Reason required

---

# 13. SUCCESS METRICS

## 13.1 Code Quality

- Test coverage > 90%
- Zero critical bugs

---

## 13.2 Performance

- API latency < 200ms
- 99.9% uptime

---

## 13.3 UX Quality

- Task completion rate > 95%
- Error rate < 2%

---

## 13.4 Development Efficiency

- Deployment frequency high
- Lead time low

---

# 14. ANTI-PATTERNS (FORBIDDEN)

- Large untested changes
- Skipping research
- Skipping tests
- Assumption-based logic
- Tight coupling
- Premature optimization
- Over-engineering

---

# 15. DOCUMENTATION STANDARDS

Each component must include:
- Purpose
- Inputs
- Outputs
- Edge cases
- Failure modes

---

## 15.1 Format

- Structured
- Machine-readable
- Versioned

---

# 16. EXECUTION WORKFLOW

MANDATORY FOR EVERY TASK:

1. Research
2. Plan
3. Implement (small unit)
4. Write tests
5. Execute & validate
6. Verify UX
7. Document

---

# 17. CONSTRAINT DEFINITIONS

## Allowed

- Incremental improvements
- Refactoring with tests
- Modular extensions

---

## Forbidden

- Breaking changes without migration
- Undefined behavior
- Silent failures

---

# 18. SELF-CRITIQUE & SYSTEM LIMITATIONS

## 18.1 Identified Weaknesses

- Heavy reliance on deterministic inputs
- AI agents may misinterpret vague tasks
- External integrations may introduce unpredictability

---

## 18.2 Mitigations

- Strict schemas
- Explicit contracts
- Validation layers

---

## 18.3 Missing Constraints (Resolved)

- Added strict module boundaries
- Added deterministic execution flow
- Enforced no-assumption rule

---

# FINAL DIRECTIVE

This document is the **single source of truth**.

If a situation is not covered:
→ The system must default to:
   - determinism
   - safety
   - validation

No deviation allowed without updating this document.

---
END OF FILE