# Test plan: Attention queue

## Cases
| Scenario | Type | Expected |
|----------|------|----------|
| No deals | API integration | `actions: []` |
| 12 overdue payments on one deal | API integration | `actions.length === 12` (uncapped) |
| Dashboard cap unchanged | API integration | `priorityActions.length === 10`, `priorityActionsTotalCount === 12` |
| Client getAttention | Unit | Calls `/api/v1/attention` |

## Coverage
`apps/api/src/__tests__/attention.test.ts`, extended `dashboard.test.ts`, `apps/web/lib/__tests__/api.test.ts`.
