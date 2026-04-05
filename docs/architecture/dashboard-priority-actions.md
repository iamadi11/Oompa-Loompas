# Architecture: Dashboard priority actions

## Module
**Intelligence** (read-only aggregation for decision surfacing). Reads Deal, Payment, and Deliverable data; no writes.

## Data flow
Input: Prisma `deal.findMany({ include: { payments, deliverables } })`  
→ Validate: existing row shapes  
→ Normalize: map to `DashboardPriorityAction` discriminated union  
→ Process: filter overdue via `computeIsOverdue` / `computeIsDeliverableOverdue`, sort, cap at 10  
→ Output: JSON field `priorityActions` on dashboard DTO

## Data model changes
None. Uses existing `dueDate`, `status`, and relations.

## API contract
`DashboardSummary.priorityActions`: array of

- `{ kind: 'overdue_payment', dealId, dealTitle, paymentId, amount, currency, dueDate }`
- `{ kind: 'overdue_deliverable', dealId, dealTitle, deliverableId, deliverableTitle, dueDate }`

Backward-compatible additive field; clients ignoring it keep working once they accept unknown JSON keys (Next server page uses full type).

## Events
Emits: none.  
Consumes: none.

## Scale analysis
Single query loads all deals (same as pre-change dashboard). Action list built in memory O(payments + deliverables). At very large portfolios, a future indexed query or materialized view would be warranted — out of scope for Phase 1.

## Tech choices
| Choice | Alternatives | Why this |
|--------|----------------|----------|
| Extend dashboard endpoint | New `/priority-actions` route | One round-trip; matches mental model of “open app → see state + next steps” |
| Cap at 10 | Return all | Bounded payload; forces prioritization |

## Operational design
Standard API deploy. Rollback: remove field usage in web first, then API, or deploy API with unused field (safe).
