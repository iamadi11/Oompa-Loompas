# Decision: Payment Tracking
Date: 2026-04-04
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Attach payment records to deals. A creator can record expected payments (amount, due
date), mark them as received, and see their payment status at a glance. Overdue
detection is computed at query time — no background worker needed in Phase 1.
The system supports partial payments (multiple payment records per deal).

## Why Now
Deal CRUD without payments delivers zero revenue intelligence. A creator knows they
have a ₹80,000 deal, but not: How much is due? When? Has it been paid? Is it
partially received? Without payment tracking, the system is a relabeled spreadsheet.
Payment tracking is the other half of Phase 1's "Deal + Payment Intelligence" directive.
Every day without it, creators have no reason to return to the product.

## Why Not "Auto-detect OVERDUE via background worker"
Phase 1 is synchronous request/response only. Workers come in Phase 2. Overdue
detection is computed at query time (if dueDate < now && status is PENDING → returned
as OVERDUE). This delivers the same UX value with zero infra added.

## Why Not "Add payment amount to the deal directly"
A deal may have multiple payments (deposit + balance, or monthly milestone payments).
A single field cannot represent this. The `payments` table already exists in the schema
for exactly this reason.

## Why Not "Build notification reminders first"
Reminders require a background worker (Phase 2). Payment tracking requires only the
existing synchronous stack. Correct dependency order: tracking → reminders.

## User Without This Feature
1. Creator records a ₹80,000 deal in the system ✓
2. They agree to 50% upfront (₹40,000) and 50% on delivery
3. They receive ₹40,000 but have nowhere to record it
4. 30 days later, delivery is complete — they expect ₹40,000 more
5. They check WhatsApp DMs to find when they sent the invoice
6. They can't tell if the second payment is overdue without mental math
7. They follow up on email — 3 days later receive payment
8. Total time wasted: 45 minutes of manual tracking they should not be doing

## Success Criteria
- Creator can attach a payment expectation to a deal in <30 seconds
- Overdue payments are visually distinct (red badge) without any action from creator
- Payment received in <3 clicks: open deal → find payment → mark received
- Deal summary shows: total contracted, total received, outstanding balance
- ≥90% test coverage on new code
- API responds in <200ms at p99

## Assumptions (to be validated)
- Creators work with 1-3 payment milestones per deal (not hundreds)
- INR is the primary currency for payments matching their deal currency
- Partial payment is common (deposit + balance is standard for brand deals)
- Creators want to mark payments received manually, not auto-detect via bank import (Phase 4)
