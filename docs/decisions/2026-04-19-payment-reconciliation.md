# Decision: Bank CSV Payment Reconciliation

**Date:** 2026-04-19  
**Phase:** 2  
**Status:** Approved

## What

Upload a bank/UPI statement CSV (or enter amounts manually) → system matches credit rows to pending payments by amount → creator reviews matches → approves → payments marked RECEIVED with received date.

## Why Now

SOT §24.1 defines this for Phase 2. The payment loop is currently open: creators get notified (push + digest) when payments are overdue but must close the loop manually — check bank app, find deal, find payment, update status. With 5+ active deals = 35+ taps per reconciliation cycle. Digest (v0.5.4) closed the alert side. This closes the confirmation side.

## Why Not Alternatives

| Alternative | Rejected because |
|---|---|
| Bank API (Plaid/Setu) | OAuth complexity, India bank-specific APIs, licensing |
| Auto-reconcile without approval | SOT §24.2 — creator must approve all write operations on payments |
| Manual "mark received" UI improvements | Still requires per-payment navigation |

## User Without This

Creator checks UPI/bank app → opens Oompa → navigates to Deals → finds brand → opens deal → scrolls to payment → clicks Edit → changes status to RECEIVED → adds received date → saves. ×N for N payments. 7 taps minimum per payment; 70+ taps/month for active creators.

## Success Criteria

- Creator can reconcile ≥5 payments in ≤60 seconds
- Matches 100% of exact-amount single payments
- Zero false confirms (creator-gated approval before any status update)

## Assumptions

- Creators can export a CSV from their bank/UPI app (all major Indian banks support this)
- Most payments are round numbers (simplifies amount matching)
- One-to-one payment-to-credit matches sufficient for MVP (not split payments)
- Client-side CSV parsing avoids file upload complexity and keeps data in browser
