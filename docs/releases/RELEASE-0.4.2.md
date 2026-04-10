# Release 0.4.2 — Payment milestones CSV export

**Date:** 2026-04-12

## Summary
Adds authenticated CSV export of all payment milestones (with deal title and brand) for spreadsheet and accountant workflows.

## Verify
`pnpm typecheck && pnpm lint && pnpm test`  
Manual: Deals → Export payments CSV → open in Excel.

## Deploy
No migrations. Build `@oompa/utils` before API in CI.
