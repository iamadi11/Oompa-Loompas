# Release 0.4.3 — Deliverables portfolio CSV export

**Date:** 2026-04-13

## Summary
Adds authenticated CSV export of all deliverables (with deal title and brand) alongside existing deals and payments exports.

## Verify
`pnpm typecheck && pnpm lint && pnpm test`  
Manual: Deals → Export deliverables CSV.

## Deploy
No migrations. Build `@oompa/utils` before API in CI.
