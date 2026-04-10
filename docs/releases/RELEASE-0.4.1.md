# Release 0.4.1 — Deals portfolio CSV export

**Date:** 2026-04-11  

## Summary
Adds authenticated CSV export of the signed-in user’s deals for accountant and offline spreadsheet workflows.

## Packages
- `@oompa/utils@0.2.0` — `buildDealsPortfolioCsv`, `escapeCsvCell`, `dealsPortfolioExportFilename`  
- `@oompa/api@0.4.1` — `GET /api/v1/deals/export`  
- `@oompa/web@0.4.1` — `ExportDealsCsvButton`, `api.downloadDealsPortfolioCsv()`  

## Deploy notes
Build `@oompa/utils` before API typecheck/compile in CI (standard `pnpm build` / turbo order). No migrations.

## Verification
- `pnpm typecheck && pnpm lint && pnpm test`  
- Manual: log in → Deals → Export CSV → open file in Excel  
