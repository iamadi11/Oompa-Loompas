# Release **0.2.4** — deal next-action prompt (2026-04-09)

## Summary

Adds a **contextual next-action banner** to the deal detail page (`/deals/:id`). The banner detects when a deal is ready to advance to the next status and shows a one-click CTA to do it — answering "What should I do next?" without the creator needing to scroll to the edit form.

Also fixes a pre-existing typecheck error in `apps/api/src/routes/deals/service.test.ts` where `shareToken: null` was missing from the `serializeDeal` test fixture (introduced in 0.2.3 when `shareToken` was added to `DbDeal`).

## Status advance logic

| Current status | Condition | Suggested action |
|---------------|-----------|-----------------|
| DRAFT | always | Start negotiating → NEGOTIATING |
| NEGOTIATING | always | Mark as Active → ACTIVE |
| ACTIVE | all non-CANCELLED deliverables COMPLETED (or 0) | Mark as Delivered → DELIVERED |
| DELIVERED | all non-REFUNDED payments RECEIVED (or 0) | Close deal → PAID |
| PAID / CANCELLED | — | No banner |

## Packages touched

| Package | Change |
|---------|--------|
| `@oompa/types` | `computeDealNextAction` pure function + `DealNextAction` type |
| `@oompa/web` | `DealNextActionBanner` component; `deals/[id]/page.tsx` updated |
| `@oompa/api` | `service.test.ts` fixture fix (shareToken: null) |

## New exports (`@oompa/types`)

- `computeDealNextAction(status, payments, deliverables)` → `DealNextAction | null`
- `DealNextAction` type: `{ targetStatus, label, description }`

## Verification

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Browser: open a deal in ACTIVE status with all deliverables COMPLETED → see "Mark as Delivered" banner; click → status badge updates to Delivered, banner updates to next step. Open a DELIVERED deal with all payments RECEIVED → see "Close deal" banner; click → status badge updates to Paid, banner disappears.

## Deploy ordering

Web + types only. No API route changes. No database migrations.
