# Decision: Deal brand name suggestions (distinct brands API)
Date: 2026-04-11
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
`GET /api/v1/deals/brands` returns distinct `brandName` values for the session user with per-brand deal counts. The web deal form uses a native `<datalist>` so creators can reuse consistent brand strings without a separate client table.

## Why Now
Reduces duplicate spellings and manual recall when adding deals; low surface area (read-only aggregate, no schema change). Steps toward CRM-lite client profiles without blocking on email or worker infrastructure.

## Why Not full client profiles first
Profiles need persistence model, editing UI, and product rules; distinct brands deliver most naming consistency with minimal scope.

## Why Not email-to-deal
Inbound parsing and provider integration are an order of magnitude larger; orthogonal to form ergonomics.

## User Without This Feature
Types brand from memory or copy-pastes from old deals; inconsistent strings complicate filtering and future brand-level views.

## Success Criteria
Authenticated response only; empty portfolio returns `{ data: [] }`; suggestions appear in create and edit deal forms when the API succeeds; form usable when the request fails.

## Assumptions
`groupBy` on `brandName` with `userId` filter remains fast at Phase 1 portfolio sizes; no need to cap rows (distinct brands bounded in practice).
