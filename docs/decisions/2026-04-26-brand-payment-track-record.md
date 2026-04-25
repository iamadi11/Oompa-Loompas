# Decision: Brand Payment Track Record

**Date:** 2026-04-26  
**Phase:** 3 (Pricing Intelligence entry)  
**Status:** Approved

## What
Add payment behavior stats to brand profile: avg days to pay, on-time rate, total received per currency, received count. "Based on N payment(s)" label. No schema changes — pure aggregation on existing payments data.

## Why Now
Phase 2 automation done. System automates collection. Next highest value: tell creator *which brands need tougher terms before signing*. No current way to see "brand pays 21 days late avg" without manual deal inspection.

## Why Not Alternatives
- `contactName` field: Phase 1 CRM lite, minimal revenue impact. Micro-PR candidate.
- Revenue forecast: useful but less actionable at 2-3 deal scale. Defer until pipeline fuller.

## User Without This
Karan signs Nike deal. Nike pays 30 days late (again). No signal at deal creation. Could have required 50% advance.

## Success Criteria
Brand profile shows payment stats for brands with ≥1 received payment. Stats render correctly when dueDate or receivedAt null. No perf regression on brand profile load.

## Assumptions
- Creators consult brand profiles before signing (no deal form integration yet)
- At early usage (1-2 payments/brand), "Based on 1 payment" still informative — honest low-confidence signal beats no signal