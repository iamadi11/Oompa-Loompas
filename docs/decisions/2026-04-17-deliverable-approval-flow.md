# Decision: Deliverable Approval Flow

**Date:** 2026-04-17  
**Phase:** 2  
**Status:** Approved

## What
Token-gated brand-facing page where a brand can confirm they have reviewed and approved a delivered piece of content. Creator shares a link from the deliverable row; brand clicks "Approve"; creator sees "Brand approved" badge.

## Why Now
Phase 1 and 1.5 are complete. This is the next buildable Phase 2 feature requiring zero external infrastructure — it mirrors the existing `Deal.shareToken` / `/p/[token]` pattern exactly. Closes the approval loop without DMs.

## Why Not Alternatives
- **Scheduled email reminders**: Phase 2, requires BullMQ infrastructure not yet in place.
- **Email-to-deal capture**: Phase 4 per SOT §24.1 — needs email infra and NLP.
- **Rate floor**: Needs ≥20 deals of history per SOT §24.1.

## User Without This
Karan delivers a YouTube integration. He messages the brand on WhatsApp: "Hey, can you confirm you received and approved the video?" Waits 2 days. No paper trail. If payment is disputed, he has nothing to show.

## Success Criteria
- Creator can generate an approval link for any deliverable
- Brand can open the link (no login required) and click "Approve"
- `brandApprovedAt` timestamp is persisted
- Deal detail page shows "Brand approved" badge on the deliverable row
- Approval link can be revoked by creator

## Assumptions
- One approval per deliverable (no multi-party approval)
- Brand approval does NOT automatically change deliverable status to COMPLETED (creator still controls status)
- Approval is read-only post-approval (brand cannot retract via the public page)
