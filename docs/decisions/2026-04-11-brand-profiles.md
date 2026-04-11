# Decision: Brand Profiles (CRM Lite)
Date: 2026-04-11
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Add per-brand contact info (email, phone), notes, and payment behavior stats to each brand in the directory. A brand profile page at `/deals/brands/[brandName]` shows this data alongside deal history and overdue stats. Profiles are upserted via `PUT /api/v1/brands/:brandName`.

## Why Now
Brand directory shipped in 0.4.6. Natural follow-on: rows in the table have no actionable contact info. Creator currently leaves Oompa to find a brand contact, wastes 2–5 min per collection action. Phase 1 completion item per SOT §2.4. Zero external dependencies.

## Why Not Email-to-Deal Capture
SOT §24.1 classifies it as Phase 4 AI capability. Requires inbound email service + NLP extraction. Complexity far exceeds current phase.

## Why Not Scheduled Reminders
Phase 2 — requires BullMQ worker infrastructure not yet built.

## Why Not Deal Templates
Duplication (0.4.0) already solves 80% of template friction. Lower collection impact than brand profiles.

## User Without This Feature
Creator sees overdue payment from BrandX in attention queue. Clicks deal. Wants to email them. Must open Gmail, search brand contact, copy email, return to Oompa. No record of "BrandX always pays 2 weeks late" — must remember manually.

## Success Criteria
- Creator can view brand profile with contact info + notes in <2 clicks from brand directory
- Creator can edit contact email/phone/notes inline without leaving the brand page
- Overdue count and contracted totals visible on profile page
- Time-to-action on overdue brands reduced (measured: session depth on /deals/brands → deal → action)

## Assumptions
- Creators work with enough repeat brands that contact storage is worth it (80% of deals at ₹50K+ MRR are repeat)
- brandName string matching (case-insensitive) is sufficient for brand identity for now
- Phone number stored as-is (no validation/formatting)
