# Decision: Monorepo Foundation + Deal CRUD MVP
Date: 2026-04-04
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Bootstrap the monorepo with all structural packages (config, types, db, utils) and ship
the first user-facing feature: Deal CRUD. A creator can create, view, update, and track
the status of brand deals. This is the data foundation for all revenue intelligence.

## Why Now
The codebase is empty. No feature can exist without the foundation. Deal capture is the
entry point for the entire system — payments, notifications, pricing intelligence, and
AI-driven reminders all require a Deal entity to exist first. Building this now unblocks
every subsequent Phase 1 task and delivers immediate user value (replacing spreadsheets
and notes apps with structured, queryable data).

## Why Not "Build Intelligence First"
Intelligence requires data. There is no data without Deal capture. Starting with
intelligence is backwards.

## Why Not "Build Payment Tracking First"
Payments are attached to Deals. No Deal model → no Payment model. Correct dependency
order requires Deal first.

## Why Not Microservices
SOT §3.1 is explicit: Modular Monolith inside a Monorepo. FINAL. Not revisited.

## User Without This Feature
1. Brand emails creator: "Hey, interested in a reel — ₹80,000 budget"
2. Creator replies on email, agrees on scope
3. Creator makes a mental note or adds to a WhatsApp "Saved Messages"
4. 3 weeks later, creator delivers the content
5. Forgets to send invoice for 2 weeks
6. Follows up, brand says "already processed" — creator has no record
7. Payment arrives 6 weeks later, creator doesn't know if it was the right amount
8. No data → no pricing intelligence → no negotiation leverage on next deal

## Success Criteria
- Creator can record a deal in <60 seconds
- Creator can see all active deals on a single page
- Creator can update deal status (DRAFT → NEGOTIATING → ACTIVE → DELIVERED → PAID)
- API responds in <200ms at p99
- ≥90% test coverage on all changed code
- TypeScript strict mode passes with zero errors

## Assumptions (to be validated)
- Creators will primarily access on desktop (web-first is correct)
- ₹ (INR) is the primary currency; multi-currency comes in Phase 3
- Manual entry is acceptable for Phase 1 (email/integration capture comes in Phase 2)
- Creators track deals at the "deal" level, not per-deliverable, in Phase 1
