# UX: Upcoming Payment + Deliverable Push Notifications

## User Journey
1. Creator has push notifications enabled in Settings
2. At 07:00 IST (01:30 UTC), cron fires
3. Creator receives OS-level push notification: "Payment due soon — NikeBrand payment due in 2 days"
4. Creator taps notification → opens `/deals/<id>` in PWA
5. Creator copies payment reminder → sends to brand before due date

## Decision Points
- Creator ignores notification → no additional friction, payment may become overdue
- Creator taps notification → deal page opens, clear next action visible (send reminder CTA)

## States
- **Zero state**: no upcoming items → no push sent (not a UX moment)
- **Loading**: OS-native push delivery — no in-app loading state
- **Success**: notification delivered → creator opens deal
- **Error**: subscription stale (410) → subscription silently removed, creator won't get future pushes until they re-subscribe in Settings

## Critic Feedback
- The notification body avoids amounts (SOT §25.2) — could feel vague ("NikeBrand payment due in 2 days" vs "₹80K payment due in 2 days"), but creator knows their own deals and the URL takes them directly to the deal
- Tap-to-open works because URL is embedded in payload — no extra navigation required
- 3-day window gives creator time to act before the brand relationship is strained

## A11y
- No in-app UI added — push notification is OS-rendered
- Deep link URL in payload goes to existing `/deals/:id` which is already keyboard-accessible and WCAG 2.2 AA compliant
