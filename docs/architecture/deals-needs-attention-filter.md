# Architecture: Deals “needs attention” filter

## Module
**Deal** (read path). Reuses payment/deliverable overdue semantics aligned with `collectPriorityActionsFromDeals`.

## Data flow
Query `needsAttention=true` → validate `DealListFiltersSchema` → build `where: { AND: [..., { OR: [payments.some(...), deliverables.some(...)] }] }` → Prisma `findMany` + `count`.

## Contract
- `needsAttention`: optional, enum `true` | `false` in query string.
- Omitted: no attention filter.

## Scale
Same pagination as list deals; filter uses indexed relations (`dealId`, `dueDate`, `status` on child tables).
