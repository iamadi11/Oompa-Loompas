# Decision: Attention queue CSV export
Date: 2026-04-11
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
`GET /api/v1/attention/export` returns a UTF-8 CSV of the full priority queue (overdue payments and overdue PENDING deliverables), same ordering as `GET /api/v1/attention`. The attention page gains **Export queue CSV** when the queue is non-empty.

## Why Now
Creators and assistants need the overdue list in spreadsheets for follow-up tracking and delegation, mirroring portfolio CSV exports without new infrastructure.

## Why Not scheduled email first
Reminder automation requires worker/queue infrastructure; export reuses existing auth and Prisma read path.

## Why Not extend JSON only
Spreadsheet handoff is the stated accountant/ops workflow elsewhere in the product.

## User Without This Feature
Screenshots, manual copy from the attention UI, or re-deriving from three separate exports.

## Success Criteria
Tenant-scoped rows only; BOM for Excel; filename dated; empty queue = header-only CSV; deliverable rows include parent **brand_name** for context.

## Assumptions
5,000-row cap matches other exports and covers Phase 1 queue sizes.
