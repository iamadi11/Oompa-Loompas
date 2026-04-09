# Decision: Deal Next-Action Prompt
Date: 2026-04-09
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
A contextual banner on the deal detail page that detects when a deal is ready to advance to the next status and surfaces a one-click CTA to do it. The banner is computed from data already on the page (deal status + deliverables + payments) and calls the existing PATCH `/api/v1/deals/:id` endpoint.

Status advance conditions:
- DRAFT → NEGOTIATING: always (deal exists = creator is ready to negotiate)
- NEGOTIATING → ACTIVE: always (terms confirmed, move to active tracking)
- ACTIVE → DELIVERED: when all non-cancelled deliverables are COMPLETED (or 0 deliverables)
- DELIVERED → PAID: when all non-refunded payments are RECEIVED (or 0 payments)
- PAID / CANCELLED: no banner

## Why Now
All top-4 backlog candidates (invoice, clipboard reminder, proposal link, pipeline strip) are shipped. The biggest remaining Phase 1 gap is deal status progression — creators have to scroll to the edit form at the bottom of the deal detail page to advance status. The page currently answers "What should I do next?" for deliverables and payments but not for the deal itself. This closes the "Get Paid" loop.

## Why Not Scheduled Email Reminders
Requires Notification module, worker process, email provider, and explicit consent framework. Correct problem, wrong phase — Phase 2 infrastructure.

## Why Not Rate Floor Suggestion
Requires Intelligence module and sufficient historical deal data. Phase 3 work.

## User Without This Feature
Creator has an ACTIVE deal. Deliverables are all marked complete. Creator must:
1. Scroll to the bottom edit form
2. Open the status dropdown
3. Select DELIVERED
4. Save
Then later repeat for DELIVERED → PAID. Four interactions per transition, easy to forget.

## Success Criteria
- Banner appears on deal detail page when conditions are met
- One-click advances deal status (calls existing PATCH endpoint)
- Banner disappears / page updates after successful transition
- No banner for PAID or CANCELLED deals
- Tests lock `computeDealNextAction` determinism for all status + condition permutations
- Zero new API endpoints, zero schema changes, zero migrations

## Assumptions (to be validated)
- Creators think in deal stages and want the system to prompt them
- The ACTIVE→DELIVERED→PAID path is the most common revenue close path
