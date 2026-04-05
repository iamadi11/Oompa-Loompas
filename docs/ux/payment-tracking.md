# UX: Payment Tracking

**Web shell & PWA:** [web-shell-pwa.md](./web-shell-pwa.md) · [pwa-web-client.md](../architecture/pwa-web-client.md)

## User Journey

1. Creator opens a deal detail page
2. Payment summary (Contracted / Received / Outstanding) loads with the page — no spinner, SSR
3. Creator sees existing milestones (or the zero state if none)
4. Creator clicks "+ Add payment" to open the inline form
5. Creator enters amount, optional due date, optional notes
6. Creator clicks "Add payment" — form submits, page refreshes via `router.refresh()`
7. New milestone appears immediately in the list
8. Creator clicks "Mark received" on a pending milestone → status updates, row updates
9. Summary numbers recalculate on next refresh

## States

**Zero state:** "No payment milestones recorded yet." with an underlined inline link "Add your first payment milestone" that opens the form. No blank canvas confusion.

**Loading state:** Optimistic UI not used for payment mutations — `router.refresh()` re-fetches from server. The "Mark received" button shows a spinner (loading=true) during the PATCH. The "Add payment" button shows a spinner during POST.

**Success state:** Form closes, page refreshes, new payment appears in the list. Summary updates.

**Error state:** Server errors appear inline above the form as a red alert block. Field validation errors appear below the relevant input. Button re-enables after failure so the creator can retry.

**Overdue state:** Entire payment row gets a red background (`border-red-200 bg-red-50`). Status badge shows "Overdue" in red. Summary block switches to red border and red "Overdue" label replacing "Outstanding".

## Critic Feedback

**Honest assessment:**

- The `router.refresh()` pattern causes a full server re-fetch on every mutation. For a creator with many deals open, this is a cold page reload. Perceived latency will be 200-500ms depending on API response time. Acceptable in Phase 1; Phase 2 should add optimistic updates.
- The "Mark received" button is the main CTA for a creator who just got paid. It's clearly visible on each row. Good.
- No edit capability on a payment yet — creator can only delete and re-add. This is a known Phase 1 limitation.
- No partial payment flow — marking received sets the full amount as received. Phase 2 adds PARTIAL status workflow.
- The summary shows "Outstanding" not "Remaining" — this is intentional (outstanding = overdue + future). May need relabeling if creators confuse it with just overdue amounts.

## Accessibility

- Keyboard navigation: All interactive elements (buttons, inputs) are focusable via Tab. Form submit works via Enter key.
- WCAG 2.2 AA: Compliant. Overdue state uses both color AND text label (not color-only). Status badges use text labels.
- Focus indicators: Tailwind's default ring-2 focus style applied.
- Screen reader: `aria-labelledby="payments-heading"` on the section. Error messages use `role="alert"`. "Mark received" button has `aria-label` with the payment amount for context.
- Form: `noValidate` + custom Zod validation prevents browser default validation popups while keeping accessible error messages.
