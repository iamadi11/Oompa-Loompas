# Architecture: Deals list document titles

## Module

**Deal** (web surface: **`apps/web/app/deals/page.tsx`**). No API or schema changes.

## Data flow

**Input:** `searchParams` from the App Router request.  
**Validate / normalize:** `isDealsNeedsAttentionFilter()` in `lib/deals-page.ts` (handles `string | string[]`).  
**Process:** `generateMetadata` chooses segment `title` string.  
**Output:** Next composes final title with root **`title.template`**.

## API contract

None. Deals list still calls **`GET /api/v1/deals`** with optional `needsAttention=true` as before.

## Events

None.

## Scale

Metadata is **O(1)** per request; no caching change.

## Operational design

Standard **Next.js** deploy. Rollback: revert segment metadata + `lib/deals-page` usage.
