# Release 0.4.5 — Attention queue CSV export

**Date:** 2026-04-11

## Summary
Adds `GET /api/v1/attention/export` and an export button on the attention page when the queue has items.

## Verify
`pnpm --filter @oompa/utils build && pnpm typecheck && pnpm lint && pnpm test && pnpm build`  
Manual: create overdue payment or deliverable → Attention → Export queue CSV.

## Deploy
No migrations. Build `@oompa/utils` before API in CI.
