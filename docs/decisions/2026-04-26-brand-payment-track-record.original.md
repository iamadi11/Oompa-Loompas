# Decision: Brand Payment Track Record

**Date:** 2026-04-26  
**Phase:** 3 (Pricing Intelligence entry)  
**Status:** Approved

## What
Add payment behavior stats to the brand profile page: avg days to payment, on-time rate, total received per currency, and received payment count. Labeled "Based on N payment(s)" for transparency. No schema changes — pure aggregation on existing payments data.

## Why Now
Phase 2 automation (follow-up emails, reconciliation, scheduled reminders) complete. System now automates collection actions. Next highest value: tell creator *which brands need tougher terms before signing*. Creator has no current way to see "this brand pays 21 days late on average" without manually inspecting each deal.

## Why Not Alternatives
- `contactName` field: Phase 1 CRM lite completion, but minimal direct revenue impact. Micro-PR candidate.
- Revenue forecast: useful but less actionable at 2-3 deal scale. Defer until pipeline is fuller.

## User Without This
Karan signs a deal with Nike. Nike pays the invoice 30 days late (again). Karan had no signal at deal creation that Nike is a serial late payer. He could have required 50% advance.

## Success Criteria
Brand profile page shows payment behavior stats for any brand with ≥1 received payment. Stats render correctly when dueDate or receivedAt is null (graceful null handling). No performance regression on brand profile load.

## Assumptions
- Creators will consult brand profiles before signing new deals (no deal form integration yet)
- At early usage (1-2 payments/brand), "Based on 1 payment" is still informative — honest low-confidence signal is better than no signal
