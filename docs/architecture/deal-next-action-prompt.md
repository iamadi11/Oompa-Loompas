# Architecture: Deal Next-Action Prompt

## Module: Deal
## Data Flow
Input (deal.status + payments[].status + deliverables[].status) → Validate (computeDealNextAction) → Normalize (DealNextAction | null) → Process (DealNextActionBanner renders CTA) → Output (PATCH /api/v1/deals/:id + router.refresh())

## Data Model Changes
None. No schema changes. No migrations required.

## API Contract
Reuses existing: `PATCH /api/v1/deals/:id` with body `{ status: DealStatus }`.
Guarded server-side by `isValidStatusTransition` — invalid transitions return HTTP 409.

## New pure function: `computeDealNextAction`
Location: `packages/types/src/deal.ts`
Inputs: `DealStatus`, `Array<{ status: string }>` (payments), `Array<{ status: string }>` (deliverables)
Outputs: `DealNextAction | null`

```
DealNextAction = {
  targetStatus: DealStatus
  label: string        // button text
  description: string  // supporting copy
}
```

Logic:
| Current Status | Condition | Target | Label |
|----------------|-----------|--------|-------|
| DRAFT | always | NEGOTIATING | "Start negotiating" |
| NEGOTIATING | always | ACTIVE | "Mark as Active" |
| ACTIVE | all non-CANCELLED deliverables = COMPLETED (or 0) | DELIVERED | "Mark as Delivered" |
| DELIVERED | all non-REFUNDED payments = RECEIVED (or 0) | PAID | "Close deal" |
| PAID / CANCELLED | — | null | — |

## New component: `DealNextActionBanner`
Location: `apps/web/components/deals/DealNextActionBanner.tsx`
Type: Client Component (`'use client'`)
Inputs: dealId, deal.status, payments (serialized), deliverables (serialized)
Outputs: renders action banner or null; on confirm calls `api.updateDeal(id, { status })` + `router.refresh()`
States: idle | loading | error
Edge cases: API returns 409 (invalid transition) → show error message; network error → show error

## Events
Emits: none (relies on `router.refresh()` for page state update)
Consumes: none

## Scale Analysis
Pure frontend computation — O(n) over payments and deliverables per deal. No additional DB queries. No caching needed.

## Tech Choices
| Choice | Alternatives | Why This |
|--------|-------------|----------|
| Pure function in @oompa/types | Web-only logic | Testable in isolation, reusable in API/worker later |
| router.refresh() | manual state update | RSC page data re-fetches from API — consistent with PaymentSection pattern |
| Existing PATCH endpoint | New endpoint | Zero API surface change; transition guard already in place |

## Operational Design
- Deploy: web-only change. No API changes, no migrations.
- Monitoring: no new signals needed; existing deal update path is already observable.
- Rollback: revert the component file + page.tsx change. No data to repair.
