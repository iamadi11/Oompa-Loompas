# Release 0.4.4 — Deal brand suggestions

**Date:** 2026-04-11

## Summary
Adds `GET /api/v1/deals/brands` and deal form brand `<datalist>` suggestions from existing deals.

## Verify
`pnpm typecheck && pnpm lint && pnpm test && pnpm build`  
Manual: Create or edit deal → Brand name shows suggestions when you have prior deals.

## Deploy
No migrations. Deploy API and web together so the client path exists.
