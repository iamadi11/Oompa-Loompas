# Architecture: Payment Tracking

## Module: Payment (sub-module of Deal)

## Data Flow

```
HTTP Request
  → Fastify route (apps/api/src/routes/payments/index.ts)
  → Handler (handlers.ts)
  → Input: Validate with CreatePaymentSchema / UpdatePaymentSchema (Zod)
  → Normalize: parse Decimal, dates, nullable fields
  → Process: Prisma CRUD on `payments` table
  → Output: serializePayment() → JSON response with computed `isOverdue`
```

## Data Model Changes

### New table: `payments`

```prisma
model Payment {
  id         String        @id @default(uuid())
  dealId     String        @map("deal_id")
  deal       Deal          @relation(fields: [dealId], references: [id], onDelete: Cascade)
  amount     Decimal       @db.Decimal(15, 2)
  currency   Currency      @default(INR)
  status     PaymentStatus @default(PENDING)
  dueDate    DateTime?     @map("due_date")
  receivedAt DateTime?     @map("received_at")
  notes      String?       @db.Text
  createdAt  DateTime      @default(now()) @map("created_at")
  updatedAt  DateTime      @updatedAt @map("updated_at")

  @@index([dealId])
  @@index([status])
  @@index([dueDate])
  @@map("payments")
}
```

**Retention policy:** Payment records are retained as long as the parent Deal exists. Cascade delete on Deal removal. No soft delete in Phase 1.

**Migration:** Forward-compatible additive migration. No existing data affected.

### Deal model: no schema changes. Payments accessed via relation.

## API Contract

### List payments
`GET /api/v1/deals/:dealId/payments`
- Input: `dealId` UUID path param
- Output: `{ data: Payment[] }`
- 404 if deal not found

### Create payment
`POST /api/v1/deals/:dealId/payments`
- Input: `CreatePaymentSchema` — `{ amount: number, currency?, status?, dueDate?: string|null, notes?: string|null }`
- Output: `{ data: Payment }`
- 400 on validation failure, 404 if deal not found

### Update payment
`PATCH /api/v1/payments/:id`
- Input: `UpdatePaymentSchema` — any subset of payment fields
- Output: `{ data: Payment }`
- 400 on validation failure, 404 if payment not found

### Delete payment
`DELETE /api/v1/payments/:id`
- Output: 204 No Content
- 404 if payment not found

**Versioning:** All routes under `/api/v1/`. Breaking changes require `/api/v2/` prefix.

### Payment response shape
```typescript
{
  id: string
  dealId: string
  amount: number          // Decimal → number serialization
  currency: Currency
  status: PaymentStatus
  dueDate: string | null  // ISO 8601
  receivedAt: string | null
  notes: string | null
  isOverdue: boolean      // computed, not stored
  createdAt: string
  updatedAt: string
}
```

## `isOverdue` Computation

Computed at serialization time in `serializePayment()`:
- `isOverdue = dueDate !== null && dueDate < Date.now() && status ∈ {PENDING, PARTIAL}`
- Never stored. Always fresh. No background worker needed in Phase 1.

## Payment Summary (`computePaymentSummary`)

Computed in `@oompa/types`. Pure function, no I/O:
```
totalContracted = dealValue
totalReceived   = sum(amount where status ∈ {RECEIVED, PARTIAL})
totalOutstanding = totalContracted - totalReceived
hasOverdue      = any(isOverdue)
paymentCount    = payments.length
```

## Events

Emits: none (Phase 1 — no event bus)
Consumes: none

## Scale Analysis

**Bottleneck at scale:** `findMany` for payments per deal — bounded by payments per deal (expected <50). Indexed on `dealId`.

**Overdue query pattern:** Computed at read time. At 10K deals × 10 payments = 100K rows — all indexed. Acceptable for Phase 1.

**Caching:** None in Phase 1. Add Redis cache for payment lists at Phase 3 if P99 latency degrades.

**Async boundary:** All synchronous per-request. No async jobs needed in Phase 1.

## Tech Choices

| Choice | Alternatives | Why This |
|--------|-------------|----------|
| Compute `isOverdue` at read time | Store flag, background worker | No infrastructure, always accurate, simpler |
| Cascade delete on Deal | Soft delete, orphan payments | Payments have no meaning without a Deal; clean data |
| DECIMAL(15,2) for amount | FLOAT, INTEGER cents | Exact arithmetic for financial values; matches Deal.value |
| Zod validation at API boundary | Manual validation | Consistent with Deal module; shared schemas in @oompa/types |

## Operational Design

**Deploy:** Standard Next.js + Fastify deploy. DB migration runs via `prisma migrate deploy` before API startup.

**Monitoring:** Track `POST /api/v1/deals/:dealId/payments` error rate and P99 latency. Alert if error rate > 1% or P99 > 500ms.

**Rollback:** Migration is additive (new table). Rollback = drop `payments` table. No existing data at risk.

**RPO/RTO:** No change from Deal module baseline.
