---
name: plan-task
description: Decompose goals into atomic, testable tasks per SOT §21.2 — Planner agent workflow
---

## Plan Task

Planner agent workflow. Decompose any goal into a task graph of atomic, testable, independent units.
Each task must be small enough to be implemented, tested, and reversed independently.

### Step 1 — Understand the Goal

1. Read the goal statement
2. Identify which module owns this work (Deal, Payment, Deliverable, Notification, Intelligence)
3. `get_architecture_overview` — confirm module ownership and boundaries
4. `get_affected_flows` — understand which execution paths are touched
5. Check: does this goal pass the build filter?
   - Increases revenue OR reduces risk?
   - Can be automated OR reduces manual effort?
   - Is simplest viable system?

### Step 2 — Decompose into Atomic Tasks

For each atomic task, define:
- **Input**: what this task receives
- **Output**: what this task produces
- **Success criteria**: how to verify it's done
- **Dependencies**: which tasks must complete first
- **Agent**: which agent role executes it (Planner/Researcher/Developer/Tester/Reviewer/Optimizer)

Rules for tasks:
- Small enough to complete in one session
- Testable independently
- Independent of other in-progress tasks where possible
- Reversible if something goes wrong

### Step 3 — Build Task Graph

```
[Task 1: Research] → [Task 2: Plan Tests] → [Task 3: Implement Unit A]
                                          → [Task 4: Implement Unit B]
                                          → [Task 5: Integration Test]
                                          → [Task 6: Validate UX]
                                          → [Task 7: Document]
                                          → [Task 8: Instrument]
```

Identify:
- Which tasks can run in parallel?
- Which tasks are sequential dependencies?
- What are the rollback points?

### Step 4 — Risk Assessment

For each task:
1. `get_impact_radius` on affected files — blast radius
2. Flag high-risk tasks (schema changes, auth flows, payment paths, public APIs)
3. For high-risk tasks: add explicit validation and rollback step

### Step 5 — Task Output Format

Produce a task plan:

```
## Task Plan: [Goal Name]
Module: [Deal | Payment | Deliverable | Notification | Intelligence]
Priority: [1-Revenue Impact | 2-Risk Reduction | 3-Simplicity]

### Tasks

| # | Task | Agent | Input | Output | Success Criteria | Depends On |
|---|------|-------|-------|--------|-----------------|------------|
| 1 | Research feasibility | Researcher | Goal statement | Research artifact | Feasibility confirmed | — |
| 2 | Define tests | Tester | Research artifact | Test specs | Cases cover happy+edge+failure | 1 |
| 3 | Implement [X] | Developer | Test specs | Code + passing tests | Tests green, compiles | 2 |
| 4 | Validate UX | Developer | Running code | Validation report | Real browser pass | 3 |
| 5 | Document | Developer | Code | Docs | Purpose/inputs/outputs/edges | 3 |
| 6 | Review | Reviewer | All above | Review report | No anti-patterns, contracts clean | 3,4,5 |
| 7 | Instrument | Developer | Feature | Measurement plan | Post-deploy metrics defined | 6 |

### Rollback Plan
[If task N fails: revert X, restore Y]

### Escalation Triggers
[Conditions that require human input — keep minimal]
```

### Autonomy Boundary

The plan must be executable without human input except for:
- Explicitly blocked tasks where all retries failed
- Organizational policy gates (credentials, legal sign-off)

Everything else → autonomous execution per the plan.
