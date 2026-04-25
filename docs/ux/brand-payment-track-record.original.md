# UX: Brand Payment Track Record

## Journey
Creator has a deal with Nike. Nike is late on a payment (again). Creator goes to `/deals/brands/Nike`. They see a new "Payment track record" section with: "Paid on time 33% of the time · Avg 14 days late · Based on 3 payments."

Next time creator considers taking another Nike deal, they visit the brand profile FIRST and see this signal before signing.

## Screens

### Brand Profile Page — new "Payment track record" section

Appears BELOW the Overview stats and ABOVE the Contact info section. Only rendered when `receivedPaymentsCount > 0`.

**Zero state:** Section hidden entirely when no received payments yet.

**Loading:** Server-side rendered — no loading state needed.

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

**Risk signal:** If `avgDaysToPayment > 14` or `onTimeRate < 0.5`, show subtle amber warning:
`⚠ Typically pays late — consider requiring advance payment`

**Edge cases:**
- `avgDaysToPayment` null: row hidden (no qualifying payments with both fields)
- `onTimeRate` null: row hidden
- Negative avgDaysToPayment (paid early): show "Paid early (X days avg)" in green
- All payments on time (onTimeRate = 1.0): show "100% on time" in green

## Critic Feedback (Karan persona)
"I can immediately see if Nike is reliable. I don't have to count manually. But will I remember to check this BEFORE signing? Probably not until I get burned once — but after that first time, I'll always check." → Acceptable behavior: the page is visible and clear; adoption is driven by a bad first experience.

## A11y
- Section uses `<section aria-label="Payment track record">`
- Stats use `<dl>` / `<dt>` / `<dd>` pattern matching existing Overview section
- Warning uses `role="alert"` only when condition is severe (≥30 days avg or ≤33% on time)
- WCAG 2.2 AA: amber/green color alone not used for critical info — always accompanied by text
