# Architecture: Deliverable Tracking

**Web shell & PWA:** [web-shell-pwa.md](../ux/web-shell-pwa.md) · [pwa-web-client.md](./pwa-web-client.md)

## Module: Deal (Deliverable is a child entity of Deal)

## Data Flow
Input → Validate (Zod) → Normalize (dates to Date, strip whitespace) → Process (Prisma) → Output (serialized JSON)

## Data Model Changes

### New Enums (schema.prisma)
```
DeliverableStatus: PENDING | COMPLETED | CANCELLED
DeliverablePlatform: INSTAGRAM | YOUTUBE | TWITTER | LINKEDIN | PODCAST | BLOG | OTHER
DeliverableType: POST | REEL | STORY | VIDEO | INTEGRATION | MENTION | ARTICLE | OTHER
```

### New Model: Deliverable
```
id          String              UUID primary key
dealId      String              FK → Deal, CASCADE DELETE
title       String              VarChar(255) — "3x Instagram Reels" or specific title
platform    DeliverablePlatform — where the content goes
type        DeliverableType     — what kind of content
dueDate     DateTime?           — optional, used for overdue detection
status      DeliverableStatus   — PENDING (default) | COMPLETED | CANCELLED
completedAt DateTime?           — set when status → COMPLETED
notes       String?             — optional internal note
createdAt   DateTime
updatedAt   DateTime

Indexes: dealId, status, dueDate
```

### Deal model update
Add `deliverables Deliverable[]` relation.

### Migration
Applied via `prisma db push` (no migrations dir exists in this repo — dev-stage schema push).

### Retention policy
Deliverables are permanently deleted when the parent Deal is deleted (Cascade).
Archived/cancelled deliverables are retained on the record with status=CANCELLED.

## API Contract

### Endpoints
```
GET    /api/v1/deals/:dealId/deliverables       → 200 { data: Deliverable[] }
POST   /api/v1/deals/:dealId/deliverables       → 201 { data: Deliverable }
PATCH  /api/v1/deliverables/:id                 → 200 { data: Deliverable }
DELETE /api/v1/deliverables/:id                 → 204
```

### Input: CreateDeliverable
```typescript
{
  title:    string (1–255, required)
  platform: DeliverablePlatform (required)
  type:     DeliverableType (required)
  dueDate?: string (ISO datetime) | null
  notes?:   string (max 2000) | null
}
```

### Input: UpdateDeliverable
```typescript
{
  title?:    string (1–255)
  platform?: DeliverablePlatform
  type?:     DeliverableType
  dueDate?:  string (ISO datetime) | null
  status?:   DeliverableStatus
  notes?:    string (max 2000) | null
}
```

Note: Setting status=COMPLETED via PATCH auto-sets completedAt to server NOW.
Reverting to PENDING clears completedAt.

### Output: Deliverable (serialized)
```typescript
{
  id, dealId, title, platform, type,
  dueDate: string | null,
  status,
  completedAt: string | null,
  notes: string | null,
  isOverdue: boolean,   // computed at read time: dueDate past + status=PENDING
  createdAt, updatedAt
}
```

### Error cases
- 404: Deal not found (GET/POST)
- 404: Deliverable not found (PATCH/DELETE)
- 400: Validation error (missing required fields, invalid enum values)

## Events
Emits: none (Phase 1 — no event bus yet)
Consumes: none

## Scale Analysis
- **Query pattern**: `findMany({ where: { dealId }, orderBy: { createdAt: asc } })` — covered by `@@index([dealId])`
- **Bottleneck at scale**: None expected at Phase 1 user count. At 10K creators × 10 deliverables/deal = 100K rows max. Single-indexed query returns in <5ms.
- **Caching**: None in Phase 1. Deliverables are read-time computed (isOverdue). Redis cache in Phase 2 if latency evidence warrants.
- **Async/sync boundary**: All synchronous REST. No background jobs needed.

## Tech Choices
| Choice | Alternatives | Why This |
|--------|-------------|----------|
| Compute `isOverdue` at read time | Store derived boolean | Same pattern as payments — no sync issues, always accurate |
| No "mark complete" dedicated endpoint | Dedicated `/complete` route | PATCH is the right HTTP verb for state changes; follows payment pattern |
| Platform + Type enums | Freeform text fields | Structured data enables future filtering/analytics; creators think in "Instagram Reel" not "content piece #3" |
| Cascade delete with Deal | Soft-delete deliverables | Phase 1: simplicity wins. If a deal is deleted, its deliverables are gone. |

## Operational Design
- Deploy: standard `prisma db push` + standard API deploy
- Monitoring: deliverable creation rate, completion rate, error rate on endpoints
- Rollback: remove routes from server.ts, deliverable table is additive (no existing data affected)
- RPO/RTO: same as existing DB — no new infra
