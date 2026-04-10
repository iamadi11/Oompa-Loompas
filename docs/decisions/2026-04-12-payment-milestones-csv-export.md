# Decision: Payment milestones CSV export
Date: 2026-04-12
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
`GET /api/v1/deals/export/payments` returns a CSV of every payment row for deals owned by the session user, including parent deal title and brand. Web adds **Export payments CSV** on the deals page.

## Why Now
Deal-level export shipped in 0.4.1; accountants and creators still need line-level milestones (amounts, due dates, invoice numbers) for reconciliation and tax. Same pattern as deals export: no migration, session-scoped read.

## Why Not full client profiles first
CRM-style brand entities need schema and UX design; payment export unblocks spreadsheet workflows immediately.

## Why Not deliverable CSV in same PR
Single extra surface keeps review small; deliverable export can follow same pattern if requested.

## User Without This Feature
User exports deals CSV then manually splits contract value across milestones in a sheet, or copies each payment from the UI.

## Success Criteria
- One click from Deals → payments file downloads  
- Rows only for user’s deals; 401 without session  
- Excel opens file with BOM  

## Assumptions
- 10k payment cap sufficient for Phase 1; revisit with pagination if needed.  
