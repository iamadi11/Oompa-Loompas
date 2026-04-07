# Decision: Payment reminder copy (clipboard)

Date: 2026-04-08  
Phase: 1 (Deal + Payment intelligence)  
Status: APPROVED

## What

Deterministic plain-text **payment follow-up messages** creators can **copy in one tap** from the deal payments panel and from **overdue payment** rows on the overview and attention queue. Messages include amount, optional due date, and an **absolute invoice URL** (same origin).

## Why Now

Ranked product candidate **#2** is payment reminders; there is **no worker, email provider, or schedule** in the repo yet. Clipboard copy delivers most of the **“fewer overdue receivables”** outcome immediately (creators already chase in WhatsApp/email) without consent, deliverability, or job infrastructure. **HTML invoice v1** is already shipped, so linking the invoice in the message is low lift and increases payment velocity.

## Why Not scheduled email reminders

Requires **Notification** module ownership, **explicit consent**, templates, bounce handling, and a **worker** or provider integration. Correct problem, wrong smallest step.

## Why Not PDF invoice export

Already have **HTML invoice**; PDF adds weight without unlocking the reminder workflow first.

## User Without This Feature

Manually re-types amount, deal name, and due date into chat, finds the invoice link separately, and risks inconsistent follow-ups.

## Success Criteria

- Creators can copy a complete reminder from **deal detail** for any non-settled payment.
- Creators can copy from **priority / attention** overdue payment cards without opening the deal first.
- Message text is **stable** for identical inputs (tests lock formatting).

## Assumptions (to be validated)

- Creators prefer **paste into their own channel** over in-app “send” for v1.
- **Same-origin** invoice URLs are acceptable for sharing (session may be required for access — document in UX).
