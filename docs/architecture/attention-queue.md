# Architecture: Attention queue

## Module
**Intelligence** (read-only aggregation). Reuses Deal / Payment / Deliverable data.

## Data flow
Input: same Prisma `deal.findMany({ include: payments, deliverables })` as dashboard  
→ `collectPriorityActionsFromDeals` in `apps/api/src/lib/priority-actions.ts`  
→ Output: full array for `/attention`; dashboard slices first `MAX_DASHBOARD_PRIORITY_ACTIONS` and adds `priorityActionsTotalCount`.

## API
- `GET /api/v1/attention` → `{ data: { actions: DashboardPriorityAction[] } }`
- `GET /api/v1/dashboard` → adds `priorityActionsTotalCount: number`

## Operational design
Same deploy as API; rollback by removing routes and web page (additive contract).
