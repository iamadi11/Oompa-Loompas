# Release 0.4.6 — Brand directory

**Date:** 2026-04-11

## Summary
Brand table at `/deals/brands`, expanded `GET /api/v1/deals/brands`, and `?brandName=` support on the deals list with preserved pipeline links.

## Verify
`pnpm --filter @oompa/types build && pnpm typecheck && pnpm lint && pnpm test && pnpm build`  
Manual: Deals → Brands → View deals → clear filter.

## Deploy
No migrations. Build `@oompa/types` before API/web.
