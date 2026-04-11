# UX: PWA Push Notifications — Payment Overdue Alerts

## Journey

1. Creator sees attention queue with overdue payments
2. "Enable reminders" nudge card appears (≥1 overdue, no active subscription)
3. Creator taps nudge → `/settings/notifications`
4. Settings page explains what notifications they'll get (specific, not vague)
5. Creator taps "Enable notifications" → browser permission dialog → granted
6. SW subscribes, key sent to API — done, confirmation shown
7. Next day 7am: push notification arrives — "[Brand] payment 4 days overdue"
8. Creator taps → `/deals/:id` opens directly
9. From settings: creator can disable → removes subscription

## States

### Settings page: `/settings/notifications`
| State | UI |
|-------|-----|
| SW not supported | "Push notifications require a modern browser" (static, no button) |
| SW not active (no install) | "Add Oompa to your home screen first, then return here to enable reminders" |
| Permission denied | "Notifications are blocked in your browser settings. Allow them and refresh." |
| Not subscribed | "Enable payment reminders" button + description of what triggers |
| Subscribing | Button disabled + spinner |
| Subscribed | Green tick + "You'll get reminders for overdue payments" + "Disable" button |
| Unsubscribing | Disable button disabled + spinner |
| Error | Inline error message, retry button |

### Attention queue nudge card
- Shown when: ≥1 overdue payment AND no active push subscription (local check: no subscription in localStorage)
- Dismissed: stored in localStorage for 7 days
- Copy: "Get daily reminders for overdue payments" → "Set up →" link to /settings/notifications
- Motion: fade-in with other cards, reduced-motion fallback

## Accessibility
- Settings toggle: `<button>` with `aria-pressed` for subscribed state
- Permission flow: no focus trap issues (browser dialog is native)
- Error states: `role="alert"` on inline errors
- Keyboard: all interactive elements reachable via Tab
- WCAG 2.2 AA: visible focus on all buttons, sufficient color contrast

## Critic Feedback Applied
- Pre-permission context on page before browser dialog (no cold prompt)
- SW not active → explicit message (no silent failure)
- Nudge card in attention queue (discovery path)
- Max 3 pushes/day, ordered by most overdue (most urgent first, per SOT §25)
- No amount in push payload (SOT §25.2 privacy rule)
