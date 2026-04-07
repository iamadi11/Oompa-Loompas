# Release **0.2.1** — payment reminder copy (2026-04-08)

## Summary

Adds **one-tap copy** of a deterministic **payment follow-up message** (with optional due date and **invoice link**) from deal payments and from **overdue payment** items on the overview and attention queue. Extends **`overdue_payment`** priority actions with **`brandName`** for greeting text.

## Packages touched

| Package | Change |
|---------|--------|
| `@oompa/types` | `DashboardOverduePaymentAction` + `brandName` |
| `@oompa/utils` | `buildPaymentReminderMessage` |
| `@oompa/api` | `collectPriorityActionsFromDeals` includes `brandName` |
| `@oompa/web` | `CopyPaymentReminderButton`, `PriorityActionList`, `PaymentRow` |

## Verification

```bash
pnpm --filter @oompa/types build
pnpm --filter @oompa/utils build
pnpm typecheck && pnpm lint && pnpm test
```

Browser: open a deal with a pending payment → **Copy reminder**; overview overdue card → **Copy reminder**; confirm toast and pasted text.

## Deploy ordering

**API before or with Web** so `brandName` is present when the new UI renders priority actions. No migration.
