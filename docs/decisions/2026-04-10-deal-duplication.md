# Decision: Deal Duplication
Date: 2026-04-10
Phase: Phase 1.5 — PWA + Engagement Foundations
Status: APPROVED

## What
`POST /api/v1/deals/:id/duplicate` endpoint + web "Duplicate deal" button that creates a copy of
an existing deal as a new DRAFT. The copy inherits title (appended with " (Copy)"), brandName,
value, currency, and notes. All payments and deliverables are cloned as PENDING items with no
dates. Dates (startDate, endDate) and shareToken are cleared.

## Why Now
Creators run repeat campaigns with the same brand — quarterly content, multi-platform shoots. Today
creating a repeat deal means re-entering every field from memory: annoying and error-prone.
Duplication: click → edit only what changed (price, dates) → done in 30 s. No new infrastructure
(pure Prisma, no migrations). Highest-value Low-complexity item remaining after v0.3.2 shipped the
install prompt.

## Why Not Email-to-deal capture
Requires inbound email infrastructure (Postmark/SendGrid inbound parsing). HIGH complexity.
Phase 2.

## Why Not Scheduled payment reminders
Requires BullMQ worker process. Phase 2 infrastructure not yet provisioned.

## Why Not Client/brand profiles
MEDIUM complexity. New DB entity needed. Valuable but less immediately useful than duplication for
repeat campaigns.

## User Without This Feature
1. Creator opens a past deal for reference
2. Opens "New Deal" form in another tab
3. Manually copies title, brand name, value, currency one field at a time
4. Re-adds each payment milestone with same amounts
5. Re-adds each deliverable with same platform/type
~5 minutes of tedious re-entry; high risk of typo

## Success Criteria
- "Duplicate deal" button on deal detail page
- `POST /api/v1/deals/:id/duplicate` returns 201 with new DRAFT deal
- New deal: `"<title> (Copy)"`, status DRAFT, shareToken null, dates null
- All payments cloned as PENDING (no dueDate, no invoiceNumber)
- All deliverables cloned as PENDING (no dueDate)
- On success: browser navigates to new deal detail page
- All tests green, ≥90% coverage on changed code

## Assumptions (to be validated)
- "(Copy)" suffix is clear enough — creator will rename if needed on the edit form
- Navigation to new deal immediately after duplicate is the right UX (vs. staying on source deal)
