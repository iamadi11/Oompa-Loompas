---
name: research-first
description: Structured research workflow per SOT §6 — required before any implementation
---

## Research First

Mandatory research workflow. No development starts without a complete research artifact.
Research stops when: feasibility confirmed + risks documented + simplest approach chosen.
Endless exploration without a bounded artifact is forbidden.

### Step 1 — Scope the Research

1. State the goal: what needs to be built or changed?
2. List assumptions that need validation
3. List open questions that must be answered
4. Define stopping criteria: what does "enough research" look like?

### Step 2 — Explore the Codebase (Graph First)

1. `semantic_search_nodes` — find existing related code
2. `get_architecture_overview` — understand system structure
3. `list_communities` + `get_community` — find owning module
4. `query_graph` pattern="callees_of" / "imports_of" — understand dependencies
5. `list_flows` + `get_flow` — find relevant execution paths
6. Note: what already exists that can be reused or extended?

### Step 3 — Technical Feasibility

1. Identify the technical approach
2. Check for blockers: missing dependencies, API limitations, contract conflicts
3. Assess risk: what could go wrong?
4. Check: does this approach fit within the modular monolith architecture?
5. Verify: no cross-module leakage required, no circular dependencies introduced

### Step 4 — Alternatives Analysis

For each viable alternative:
- Name the approach
- Why it's feasible or not
- Why the chosen path is simpler/better

Apply the build filter (all must be true):
1. Increases revenue OR reduces risk
2. Can be automated OR reduces manual effort
3. Is the simplest viable system

### Step 5 — Research Artifact (Required Output)

Produce a structured artifact containing:

```
## Research: [Feature/Task Name]
Date: [today]

### Goal
[What needs to be built]

### Assumptions
- [Assumption 1]
- [Assumption 2]

### Open Questions Resolved
- [Q]: [A]

### Technical Approach
[Chosen approach and why it's simplest viable]

### Alternatives Considered
| Approach | Why Rejected |
|----------|-------------|
| [Alt 1]  | [Reason]    |

### Primary Sources
- [Library/API]: [Doc URL or version]

### Risks
- [Risk 1]: [Mitigation]

### Risks Accepted (with reasoning)
- [If any]

### Stopping Criteria Met
- [ ] Technical feasibility confirmed
- [ ] Main risks documented
- [ ] Simplest viable approach chosen
- [ ] Further investigation has diminishing returns
```

### When Research Is Complete

Research is done when:
- Technical feasibility and main risks are documented
- Simplest viable approach is chosen (not most complete exploration)
- Further investigation has diminishing returns versus shipping a validated increment

Proceed to: `/implement-feature` or `/plan-task`
