# UX: Automated Payment Follow-up Emails

## User Journey

1. Creator creates deal, adds payment milestone with due date
2. Payment overdue → daily digest mentions (existing)
3. **Day 3 overdue** → creator gets triggered email: "Follow up: [Brand] payment 3 days overdue"
   - Email shows pre-composed reminder text, copy/forward ready
   - "View on Oompa" button → `/attention` page, item at top
4. Creator copies reminder, sends to brand via WhatsApp/email
5. **Day 7 overdue** (still unpaid) → escalating email, stronger copy
6. **Day 14 overdue** → final escalation email
7. Payment marked RECEIVED → no more followup emails

## Zero State (settings)
No followup emails yet. Settings shows "Follow-up emails" enabled (default). Description: "Sent at key overdue milestones (3, 7, and 14 days)".

## Loading State
Toggle shows spinner during PATCH. Matches existing digest toggle.

## Success State
Email has:
- Subject: urgency + brand name
- Which payments need attention
- Pre-composed reminder in styled quote block (easy copy)
- "View on Oompa" CTA → /attention
- Manage preferences → /settings

## Error State
Email fail → logged server-side, no record written (retry on next daily run).
No creator-facing error — emails best-effort, not guaranteed.

## Critic Feedback (solo creator, ₹50K–5L/month)

**First use:** "Oh, forgot that payment. Message already written." ✅
**After a month:** "Nudged me when distracted. Would lose track otherwise." ✅
**Churn risk:** Payment paid but not marked received → creator keeps getting followup emails. → Mitigated: RECEIVED/REFUNDED stops followup.
**Friction:** None for receiving. Settings toggle one tap to opt out.
**Potential annoyance:** 3 emails over 2 weeks same payment. → Acceptable: each escalates urgency; 3 emails / 14 days not excessive.

## Settings Page Changes

**New row in "Email Notifications" section:**
```
Follow-up emails          [Enable / Disable button]
Sent at 3, 7, and 14 days when payments remain unpaid.
```

Below "Daily Email Digest" row. Same visual pattern (status dot, toggle button).

## Accessibility
- Toggle: `aria-pressed` state
- Status indicator: text + color (not color alone) — "Enabled" / "Disabled"
- Focus visible on toggle (inherits existing Button styles)

## WCAG 2.2 AA
No new interactive patterns. Settings toggle follows existing Button focus ring + aria-pressed pattern.