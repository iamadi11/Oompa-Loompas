# Test plan: Dashboard priority actions

## Coverage baseline
Existing `GET /api/v1/dashboard` tests in `apps/api/src/__tests__/dashboard.test.ts` covered financial aggregates and recent deals.

## Test cases
| Scenario | Type | Expected | Risk |
|----------|------|----------|------|
| No deals | Integration | `priorityActions: []` | Low |
| Two overdue payments, different due dates | Integration | Older due date first | High |
| Overdue PENDING deliverable | Integration | `overdue_deliverable` shape | High |
| Known mock deal with overdue payment | Integration | Matches `pay-2` | Medium |
| 12 overdue payments | Integration | Length 10 (cap) | Medium |

## Edge cases
- RECEIVED payment with past `dueDate` → not in list (same as overdue count rules).
- Future-due PENDING payment → not in list.

## Failure mode tests
- Prisma failure → existing Fastify error handling (not duplicated here).

## Coverage target
≥90% on touched files: `handlers.ts` (dashboard), `dashboard.test.ts`.
