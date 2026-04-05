# Decision: Deliverable Tracking
Date: 2026-04-04
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Track content deliverables per deal. A creator can add the specific pieces of content
they've committed to produce (e.g., "2 Instagram Reels, 1 YouTube Integration, 3
Instagram Stories"), assign due dates, set platforms/types, and mark them complete. The
deal detail page gains a Deliverables section alongside the existing Payments section.
New API routes under `/api/v1/deals/:dealId/deliverables` (CRUD). New `Deliverable`
table in PostgreSQL via Prisma. New `deliverable.ts` type in `@oompa/types`.

## Why Now
Phase 1 "Capture" requires three data types: Deals ✓, Payment commitments ✓,
Deliverables ✗. This is the last missing piece of Phase 1's core capture capability.
Without deliverables, a deal is only half-captured — the financial side exists but not
the work obligation. Creators manage deliverables today in WhatsApp notes, Notion, or
mental accounting. They miss due dates, brands delay payment because content wasn't
delivered on time, and there is no single source of truth for what's owed. Deliverable
tracking also directly unblocks Phase 2 automation: "send invoice when deliverable is
marked complete" cannot exist without deliverable completion events.

## Why Not Invoice Generation First
Invoice generation is higher-impact but requires knowing WHAT was delivered. An invoice
that says "Collaboration — ₹80,000" is less credible than one listing "2 Reels + 1
Story + 1 YouTube Integration — ₹80,000". Deliverables come first; invoices reference
them. Building invoices before deliverables produces a weaker invoice.

## Why Not Payment Follow-up / Reminders First
Reminders require a background worker or cron infrastructure (Redis queues, worker
process, notification channels). That is Phase 2 infra. No Phase 2 infra exists in the
codebase today. Deliverable tracking is pure REST + DB + UI — no new infrastructure
classes needed.

## Why Not Pricing Intelligence First
Pricing intelligence requires N deals of historical data to detect patterns. With 3
features shipped, there is insufficient historical signal. This is Phase 3.

## User Without This Feature
1. Creator closes a brand deal: "3 Instagram posts, 1 Reel, YouTube integration — ₹1.2L"
2. They enter the deal in Oompa-Loompas: title, value, dates, payment milestones ✓
3. The 3 Instagram posts, 1 Reel, YouTube integration go in a WhatsApp message or Notion
4. Campaign runs. Creator completes 2 posts, forgets the Reel deadline
5. Brand follows up 10 days late about the Reel — creator scrambles
6. Payment milestone #2 is tied to Reel completion. Payment is now delayed by 10 days.
7. Creator checks Oompa-Loompas: sees ₹40K PENDING. Doesn't know it's blocked by a
   missed deliverable — those two facts live in different tools.

## Success Criteria
- Creator can add/delete deliverables to a deal (platform, type, title, due date)
- Creator can mark a deliverable as complete (sets completedAt timestamp)
- Deal detail page shows deliverables section below payments
- Overdue deliverables (past due, not complete) surface visually (red indicator)
- ≥90% test coverage on new API routes
- All existing deal + payment tests remain green

## Assumptions (to be validated)
- Creators think in terms of content type + platform (not just "content")
- Due dates per deliverable are more useful than a single campaign end date
- The deal detail page has room for a third section without feeling cluttered
- Marking complete is sufficient for Phase 1 — no upload/proof-of-delivery needed
