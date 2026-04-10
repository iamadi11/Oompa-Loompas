# Decision: Deals portfolio CSV export
Date: 2026-04-11
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Authenticated `GET /api/v1/deals/export` returns a downloadable CSV of the creator’s deals (deal-level columns only). Web deals page adds an “Export CSV” control that uses the session cookie and triggers a browser file download.

## Why Now
Accountants and creators routinely need a spreadsheet snapshot for taxes, invoicing reconciliation, and sharing with a CA. Today they re-type or screenshot. Export is deterministic, needs no new infrastructure, and closes a named Phase 1 gap in SOURCE_OF_TRUTH.

## Why Not Email-to-deal capture
Highest friction reducer but requires inbound email parsing and provider setup — deferred to a dedicated mail-ingest project.

## Why Not Payment-line CSV in v1
Per-deal payment rows need clear column contracts and reconciliation rules; ship deal-level export first, extend with `payments` join in a follow-up if adoption validates.

## User Without This Feature
1. Open each deal in the app  
2. Copy fields into a spreadsheet manually  
3. Repeat for every deal — error-prone and slow  

## Success Criteria
- Export completes in under a few seconds for typical portfolios (<100 deals)  
- File opens cleanly in Excel / Google Sheets (UTF-8 BOM, CRLF)  
- Only the signed-in user’s deals appear; unauthenticated requests get 401  

## Assumptions (to be validated)
- Deal-level columns are enough for the first accountant workflow; users will ask for payment rows if not.  
- A 5000-deal cap is sufficient for Phase 1; power users are rare.  
