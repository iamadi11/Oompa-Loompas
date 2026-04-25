# UX: Brand Payment Track Record

## Journey
Creator has Nike deal. Nike late on payment (again). Creator goes to `/deals/brands/Nike`. Sees new "Payment track record" section: "Paid on time 33% of the time · Avg 14 days late · Based on 3 payments."

Next Nike deal → creator visits brand profile FIRST → sees signal before signing.

## Screens

### Brand Profile Page — new "Payment track record" section

Below Overview stats, above Contact info. Only renders when `receivedPaymentsCount > 0`.

**Zero state:** Section hidden when no received payments.

**Loading:** SSR — no loading state needed.

**Populated state:**
```
Payment track record
[grid cols-2 sm:cols-3]
  Received: N payments
  Avg to payment: X days / On time
  Paid on time: X%
  Total received: ₹X [per currency]

Based on N received payment(s) — [stone-400 caption]
```

**Risk signal:** If `avgDaysToPayment > 14` or `onTimeRate < 0.5`, show amber warning:
`⚠ Typically pays late — consider requiring advance payment`

**Edge cases:**
- `avgDaysToPayment` null → row hidden
- `onTimeRate` null → row hidden
- Negative avgDaysToPayment (paid early) → show "Paid early (X days avg)" in green
- All on time (`onTimeRate = 1.0`) → show "100% on time" in green

## Critic Feedback (Karan persona)
"See Nike reliability instantly. No manual counting. But will I check BEFORE signing? Probably not until burned once — after that, always will." → Acceptable: page visible + clear; adoption driven by bad first experience.

## A11y
- Section uses `<section aria-label="Payment track record">`
- Stats use `<dl>` / `<dt>` / `<dd>` matching existing Overview section
- Warning uses `role="alert"` only when severe (≥30 days avg or ≤33% on time)
- WCAG 2.2 AA: amber/green never used alone — always with text