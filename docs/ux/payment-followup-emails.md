# UX: Automated Payment Follow-up Emails

## User Journey

1. Creator creates deal, adds payment milestone with due date
2. Payment becomes overdue → daily digest mentions it (existing)
3. **Day 3 overdue** → creator receives triggered email: "Follow up: [Brand] payment 3 days overdue"
   - Email shows pre-composed reminder text ready to copy/forward
   - "View on Oompa" button → `/attention` page with this item at top
4. Creator copies reminder text, sends to brand via WhatsApp/email
5. **Day 7 overdue** (if still unpaid) → escalating email with stronger copy
6. **Day 14 overdue** → final escalation email
7. Payment marked RECEIVED (via reconcile or manual) → no more followup emails for this payment

## Zero State (settings)
No followup emails yet. Settings page shows "Follow-up emails" as enabled (default). Creator can see the description "Sent at key overdue milestones (3, 7, and 14 days)".

## Loading State
Toggle shows spinner while PATCH request in flight. Matches existing digest toggle behavior.

## Success State
Email arrives with:
- Clear subject indicating urgency and brand name
- Which payment(s) need attention
- Pre-composed reminder text in a styled quote block (easy to copy)
- "View on Oompa" CTA → /attention
- Manage preferences link → /settings

## Error State
If email fails to send: logged server-side, no record written (will retry on next daily run).
No creator-facing error — emails are best-effort, not guaranteed.

## Critic Feedback (solo creator, ₹50K–5L/month)

**First use reaction:** "Oh, I forgot about that payment. Here's the message already written." ✅
**After a month:** "This nudged me when I was distracted. I'd lose track otherwise." ✅
**Churn risk:** If a payment is paid but not marked received, creator keeps getting followup emails. → Mitigated: once payment status is RECEIVED/REFUNDED, no more followup emails.
**Friction:** None for receiving emails. Settings toggle is one tap if they want to opt out.
**Potential annoyance:** Creator gets 3 emails over 2 weeks about the same payment. → Acceptable: each escalates urgency; total 3 emails over 14 days is not excessive.

## Settings Page Changes

**New row in "Email Notifications" section:**
```
Follow-up emails          [Enable / Disable button]
Sent at 3, 7, and 14 days when payments remain unpaid.
```

Placed below "Daily Email Digest" row. Same visual pattern (status dot, toggle button).

## Accessibility
- Toggle button: `aria-pressed` state
- Status indicator: uses text + color (not color alone) — "Enabled" / "Disabled"
- Focus visible on toggle (inherits existing Button styles)

## WCAG 2.2 AA
No new interactive patterns introduced. Settings page toggle follows existing Button focus ring + aria-pressed pattern.
