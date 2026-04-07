# Architecture: Payment reminder copy

## Module

- **Payment** (data: amounts, due dates, invoice URL path).
- **Notification** (user-visible message only — **no delivery channel** in this slice).

## Data flow

Input (deal title, brand, payment fields) → **Validate** (client-only) → **Normalize** (`buildPaymentReminderMessage` in `@oompa/utils`) → **Output** (clipboard).

API adds **`brandName`** to `overdue_payment` priority actions so the queue can build the same greeting without an extra deal fetch.

## Data model changes

None. **Additive** field on JSON: `DashboardOverduePaymentAction.brandName`.

## API contract

- `GET /api/v1/dashboard` and `GET /api/v1/attention`: each `kind: "overdue_payment"` item includes **`brandName: string`** (same as deal).

## Events

None.

## Scale

O(1) per click; no new queries.

## Operational design

No deploy order change. Rollback: revert web + API + types + utils; clients ignore unknown fields if mixed versions briefly.
