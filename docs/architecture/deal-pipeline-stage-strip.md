# Architecture: Deal pipeline stage strip

## Module: Deal

## Data Flow

```
searchParams → getDealStatusFilter() → getDeals({}) → computeStatusCounts(allDeals)
             → filter allDeals by status (server-side, no re-fetch)
             → DealPipelineStrip (counts + activeStatus)
             → DealList (filtered subset)
```

## Data Model Changes

None. Uses existing `Deal.status` field (enum: `DRAFT | NEGOTIATING | ACTIVE | DELIVERED | PAID | CANCELLED`).

## API Contract

No new endpoints. Uses `GET /api/v1/deals?limit=100&sortOrder=desc` (existing).

**Status filter:** applied in the Next.js server component, not in the API. The API fetches all deals; the page filters before rendering.

**Rationale:** avoids a second API call for status counts. Creator deal counts at current scale fit comfortably in a single 100-item fetch.

## Events

Emits: none  
Consumes: none (pure read)

## Scale Analysis

| Scale | Behavior |
|-------|----------|
| <100 deals | Single fetch, full counts, instant filter |
| >100 deals | Counts under-count beyond limit. Acceptable for Phase 1 — document limit, revisit at Phase 4 (Financial Infra) |

**Caching:** Next.js RSC request-level caching. Each page load gets a fresh fetch. No additional caching layer needed for Phase 1.

## Tech Choices

| Choice | Alternatives | Why This |
|--------|-------------|----------|
| Server-side status filter (no API param) | API `?status=X` filter | Single fetch gives counts for all statuses; avoids a second roundtrip |
| Pure `<Link>` tabs (no client JS) | Client state / useState | Server component, no hydration cost, works without JS |
| `DealStatusSchema.safeParse` for input validation | Manual string comparison | Re-uses existing Zod schema; rejects invalid/crafted URL params |

## Operational Design

- No deploy ordering requirements — purely additive change
- No migrations
- No feature flags required (no revenue path impact; purely additive UI)
- Rollback: revert the three files (`deals-page.ts`, `deals/page.tsx`, `DealPipelineStrip.tsx`)
