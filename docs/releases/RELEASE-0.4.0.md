# Release 0.4.0 — Deal Duplication

**Date:** 2026-04-10
**Type:** Feature

## What shipped
`POST /api/v1/deals/:id/duplicate` + "Duplicate deal" button on the deal detail page.

One click copies an existing deal as a new DRAFT — same brand, value, deliverables, and payment
milestones. Dates and share token cleared. Creator lands on the new deal page to adjust price and
dates for the next campaign.

## Changed files
- `apps/api/src/routes/deals/handlers.ts` — `duplicateDeal` handler
- `apps/api/src/routes/deals/index.ts` — `POST /:id/duplicate` route
- `apps/api/src/__tests__/deals.test.ts` — 6 new tests; `shareToken: null` fixture fix
- `apps/web/lib/api.ts` — `duplicateDeal` method
- `apps/web/components/deals/DuplicateDealButton.tsx` — new client component
- `apps/web/app/(workspace)/deals/[id]/page.tsx` — added `DuplicateDealButton`
- `apps/web/lib/__tests__/api.test.ts` — 1 new test

## Release gates
- [x] typecheck clean
- [x] lint clean
- [x] 228 tests passed (147 API + 81 web); ≥90% coverage
- [x] No DB migrations
- [x] Real browser validation: duplicate flow end-to-end confirmed
- [x] No secrets in source
- [x] Post-deploy signal defined
- [x] Version bumped 0.3.2 → 0.4.0 + CHANGELOG entry
