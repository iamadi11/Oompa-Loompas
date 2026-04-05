# Test Plan: Deliverable Tracking

**Web shell & PWA:** [web-shell-pwa.md](../ux/web-shell-pwa.md) · [pwa-web-client.md](../architecture/pwa-web-client.md) · [pwa-web-client testing](./pwa-web-client.md)

## Coverage Baseline
Before this work: no deliverable-related code exists in the graph.
Coverage target: ≥90% on all new files:
- `apps/api/src/routes/deliverables/handlers.ts`
- `apps/api/src/routes/deliverables/index.ts`
- `packages/types/src/deliverable.ts`

## Test Cases

| Scenario | Type | Expected | Risk Level |
|----------|------|----------|------------|
| GET deliverables for existing deal | Unit/Integration | 200 + array | Medium |
| GET deliverables for non-existent deal | Unit | 404 | High |
| GET deliverables ordered by createdAt asc | Unit | correct order | Low |
| POST create deliverable (all fields) | Unit | 201 + full object | High |
| POST create deliverable (required only) | Unit | 201 + null optionals | Medium |
| POST missing title | Unit | 400 | High |
| POST missing platform | Unit | 400 | High |
| POST missing type | Unit | 400 | High |
| POST invalid platform enum | Unit | 400 | Medium |
| POST invalid type enum | Unit | 400 | Medium |
| POST deal not found | Unit | 404 | High |
| PATCH update title | Unit | 200 + updated | Medium |
| PATCH mark COMPLETED | Unit | 200 + completedAt set | High |
| PATCH revert to PENDING | Unit | 200 + completedAt null | High |
| PATCH deliverable not found | Unit | 404 | High |
| PATCH invalid status enum | Unit | 400 | Medium |
| DELETE existing deliverable | Unit | 204 | Medium |
| DELETE non-existent deliverable | Unit | 404 | High |
| isOverdue=true (PENDING, past dueDate) | Unit | isOverdue=true | High |
| isOverdue=false (COMPLETED, past dueDate) | Unit | isOverdue=false | High |
| isOverdue=false (PENDING, no dueDate) | Unit | isOverdue=false | Medium |
| isOverdue=false (PENDING, future dueDate) | Unit | isOverdue=false | Medium |
| computeIsDeliverableOverdue (unit) | Unit | correct boolean | High |

## Edge Cases
- Title at max length (255 chars) — accepted
- Title empty string — rejected (400)
- Notes at max length (2000 chars) — accepted
- Notes over 2000 chars — rejected (400)
- dueDate in past with status=PENDING → isOverdue=true
- dueDate in past with status=COMPLETED → isOverdue=false
- dueDate in past with status=CANCELLED → isOverdue=false
- dueDate in future with status=PENDING → isOverdue=false
- No dueDate → isOverdue=false always

## Failure Mode Tests
- DB returns null for deal lookup → 404 (not 500)
- DB returns null for deliverable lookup → 404 (not 500)
- Validation runs before DB queries — no DB call on invalid input

## Coverage Target
≥90% on:
- `apps/api/src/routes/deliverables/handlers.ts`
- `packages/types/src/deliverable.ts` (computeIsDeliverableOverdue)
