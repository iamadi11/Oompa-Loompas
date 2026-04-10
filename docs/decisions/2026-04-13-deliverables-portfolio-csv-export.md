# Decision: Deliverables portfolio CSV export
Date: 2026-04-13
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
`GET /api/v1/deals/export/deliverables` returns a CSV of every deliverable for deals owned by the session user, including parent deal title and brand. Web adds **Export deliverables CSV** on the deals page.

## Why Now
Deals and payment milestone exports already shipped (0.4.1–0.4.2). Creators and accountants still need deliverable line items (platform, type, due dates, completion) in spreadsheets for ops and tax support. Same read-only, no-migration pattern.

## Why Not client profiles first
Brand/deal CRM entity is larger scope; export trilogy completes spreadsheet parity first.

## Why Not email-to-deal
Inbound email infrastructure deferred; not comparable effort.

## User Without This Feature
Manual copy from each deal detail or omission from CA pack.

## Success Criteria
One-click download; tenant-scoped rows only; Excel-friendly BOM; optional fields (due, completed, notes) present when set.

## Assumptions
10k row cap sufficient for Phase 1 deliverable counts.
