# Architecture: Deal Duplication

## Module: Deal

## Data Flow
Request → Auth check → Ownership check (findFirst + include relations) → Prisma transaction
(deal.create with nested createMany for payments + deliverables) → Serialize → 201 response

## Data Model Changes
No schema migrations. No new tables. Uses existing Deal, Payment, Deliverable models.

Cloning rules:
| Field          | Deal              | Payment         | Deliverable     |
|----------------|-------------------|-----------------|-----------------|
| id             | new (uuid)        | new (uuid)      | new (uuid)      |
| title          | `<orig> (Copy)`   | —               | same            |
| brandName      | same              | —               | —               |
| value/amount   | same              | same            | —               |
| currency       | same              | same            | —               |
| status         | DRAFT             | PENDING         | PENDING         |
| startDate      | null              | —               | —               |
| endDate        | null              | —               | —               |
| dueDate        | —                 | null            | null            |
| shareToken     | null (not set)    | —               | —               |
| invoiceNumber  | —                 | null (not set)  | —               |
| receivedAt     | —                 | null (not set)  | —               |
| completedAt    | —                 | —               | null (not set)  |
| notes          | same              | same            | same            |

## API Contract
```
POST /api/v1/deals/:id/duplicate
Auth: session cookie required
Body: (none)
Response 201: { data: Deal }  — same Deal shape as GET /api/v1/deals/:id
Response 404: { error: "Not Found", message: "Deal <id> not found" }
Response 401: { error: "Unauthorized" }
```

No new public API surface — uses same Deal serialization as all other deal endpoints.

## Implementation
- Single `prisma.deal.findFirst({ where: { id, userId }, include: { payments: true, deliverables: true } })`
- Single `prisma.deal.create({ data: { ...clone, payments: { createMany: ... }, deliverables: { createMany: ... } } })`
- No transaction needed: if create fails atomically, nothing is partially created (Prisma create + createMany is one statement)
- Returns only the new deal (not nested payments/deliverables) — consistent with existing deal endpoints

## Events
Emits: none
Consumes: none

## Scale Analysis
- Two DB queries (findFirst + create) — O(1) on deal count, O(n) on payment/deliverable count per deal
- Max deliverables/payments per deal: low (typical: 1-10). No pagination needed.
- Bottleneck: none at 10K+ creators; this is a low-frequency action
- Caching: none needed

## Tech Choices
| Choice | Alternatives | Why This |
|--------|-------------|----------|
| Nested createMany | Loop of individual creates | Atomic, single round-trip |
| No migration | New status/field | Duplicating existing schema fields only |
| 201 response | 200 | New resource created — REST convention |

## Operational Design
- Deploy: standard pipeline
- Monitoring: no new metrics; covered by existing API error rate
- Rollback: no migration = instant rollback
- RPO/RTO: unchanged
