# Architecture: Deliverable Approval Flow

## Module
Deal → Deliverable (existing module, new sub-feature)

## Data Flow
`Creator generates token → Brand opens /a/:token → Brand clicks Approve → POST /api/v1/approvals/:token → brandApprovedAt persisted → Creator sees badge on deal page`

## Schema Changes

Migration: `20260417120000_deliverable_approval_token`

```sql
ALTER TABLE deliverables ADD COLUMN approval_token VARCHAR(64) UNIQUE;
ALTER TABLE deliverables ADD COLUMN brand_approved_at TIMESTAMPTZ;
```

Prisma model additions:
```prisma
approvalToken   String?   @unique @map("approval_token") @db.VarChar(64)
brandApprovedAt DateTime? @map("brand_approved_at")
```

## API Contract

### Protected (auth required)
- `POST /api/v1/deals/:dealId/deliverables/:id/share-approval`  
  → generates `approvalToken` (64-char hex), returns `{ approvalToken, approvalUrl }`  
  → idempotent: returns existing token if already set
- `DELETE /api/v1/deals/:dealId/deliverables/:id/share-approval`  
  → sets `approvalToken = null`, `brandApprovedAt = null`  
  → body: `{}`

### Public (no auth)
- `GET /api/v1/approvals/:token`  
  → returns `DeliverableApprovalView` (no userId, no token, no dealId)
- `POST /api/v1/approvals/:token`  
  → sets `brandApprovedAt = now()` if not already set (idempotent)  
  → returns updated `DeliverableApprovalView`

### DeliverableApprovalView type
```ts
{
  id: string
  title: string
  platform: DeliverablePlatform
  type: DeliverableType
  dueDate: string | null
  status: DeliverableStatus
  brandApprovedAt: string | null
  dealTitle: string
  dealBrandName: string
}
```

## Events
None (sync only — no BullMQ in Phase 2 yet).

## Scale
Token lookup is indexed (UNIQUE constraint). No fan-out. Safe at 10K+ creators.

## Tech Choices
- Same pattern as `Deal.shareToken` / `/p/[token]` — zero novel infrastructure.
- `crypto.randomBytes(32).toString('hex')` for token generation (already in `apps/api/src/lib/share-token.ts`).
- Public routes registered outside Fastify `oompaProtectedV1` scope (same pattern as share routes).
- Web page at `/a/[token]` — flat route outside `(workspace)`, no auth middleware.

## Ops
- No migration risk: additive nullable columns.
- Rollback: remove columns, revert route registrations.
- No RPO/RTO impact.
