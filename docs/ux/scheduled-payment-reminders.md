# UX: Scheduled Payment Reminders

## Journey

1. Creator opens a deal with a PENDING payment
2. Sees "Remind me" button on the payment row (alongside "View invoice", "Share reminder", "Mark received")
3. Clicks "Remind me" → date picker appears inline with ✕ cancel
4. Selects a date → API call → date picker closes → reminder chip appears: "Reminder: DD Mon ×"
5. Creator can clear by clicking × → reminder removed, "Remind me" button returns

## States

### Zero state
No reminder set: "Remind me" button visible on all non-received, non-refunded payments.

### Loading state
`remindLoading` spinner on the "Remind me" button while API call is in flight. Date picker and ✕ cancel are `disabled` during load.

### Success state
Reminder chip: `"Reminder: {day} {month}"` in brand-700 (teal) with inline × clear button.
"Remind me" button hidden. "Remind me" returns after clearing.

### Error state
API error is silently swallowed; parent `onUpdate()` not called on failure. Page state remains as-is — user retries naturally.

## Critic feedback
- "Remind me" is creator-initiated follow-up, not a calendar event — one date, one push, then gone. Correct scope.
- No reminder for RECEIVED/REFUNDED — correct, nothing to chase.
- Date stored as midnight UTC. cron fires 01:30 UTC = 07:00 IST. Creator sees the notification at a reasonable morning hour.
- No amount in push payload (SOT §25.2 privacy rule).

## A11y
- "Remind me" button: `aria-label="Schedule a push reminder for this payment"`
- Date input: `aria-label="Select reminder date"`, `min` = today
- Clear button: `aria-label="Clear scheduled reminder"`
- All interactive elements keyboard-operable
