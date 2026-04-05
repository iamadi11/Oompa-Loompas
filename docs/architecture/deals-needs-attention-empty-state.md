# Architecture: Deals “needs attention” empty state

## Module: Deal (presentation only)

## Data flow

No API changes. `DealList` receives `deals[]` from existing `GET /api/v1/deals?needsAttention=true`. Empty array is disambiguated in the UI by `emptyVariant: 'all' | 'needsAttention'`.

Copy strings live in `apps/web/lib/deal-list-empty.ts` (`getDealListEmptyContent`) for **deterministic, testable** text without pulling React into coverage configuration.

## Data model changes

None.

## API contract

Unchanged.

## Events

None.

## Scale analysis

Static copy; no performance impact.

## Operational design

Standard web deploy. Rollback: revert `DealList` + `deals/page` + `deal-list-empty.ts`.
