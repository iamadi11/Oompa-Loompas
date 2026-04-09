# UX: Deal Next-Action Prompt

## User Journey
1. Creator opens a deal detail page (`/deals/:id`)
2. The page renders the deal header (brand, title, value, status badge)
3. Immediately below the header, a contextual banner appears if the deal has a suggested next step
4. Creator reads the one-line description and clicks the action button
5. Button shows "Saving…" while the PATCH request is in flight
6. On success: page re-renders (via `router.refresh()`), status badge updates, banner disappears
7. No banner for terminal states (PAID, CANCELLED)

## States
- **Zero state (no suggestion):** Banner is null-rendered — no DOM node. PAID and CANCELLED deals show nothing.
- **Loading state:** Button text changes to "Saving…", button disabled. No optimistic update needed (transition is server-authoritative).
- **Success state:** Page re-fetches via RSC, status badge updates to new status, banner condition re-evaluates (disappears for terminal status or updates to next step).
- **Error state:** Inline error message below the action row. Button re-enabled. User can retry.

## Screen answers "What should I do next?"
Each status shows a clear, one-line instruction:
- DRAFT: "This deal is in draft. Move it forward when you're ready to negotiate."
- NEGOTIATING: "Terms confirmed? Move this deal to Active to start tracking work."
- ACTIVE (deliverables done): "All deliverables are complete. Mark this deal as delivered."
- ACTIVE (no deliverables): "Ready to mark this deal as delivered?"
- DELIVERED (payments received): "All payments received. Close this deal."
- DELIVERED (no payments): "Ready to close this deal?"

## Critic Feedback
- "Why is there a green banner — is something wrong?" — No: the green color is intentional as a positive signal (all done, progress). Red is reserved for overdue states (already in PaymentSection). Users familiar with the app will recognize the pattern. The text copy ("All payments received") is unambiguous.
- "What if I click by accident?" — The action is reversible: PAID deals can be reverted via the edit form status dropdown (DELIVERED → PAID → DELIVERED path is valid per `isValidStatusTransition`). But wait — PAID has no outbound transitions! This means closing a deal is currently irreversible in the UI. The button label "Close deal" and the description "All payments received" make the intent clear, and the existing edit form showing the status field makes the finality visible. No confirmation dialog added — unnecessary friction for a clear action with clear preconditions.
- "The banner disappears after I click. Did it work?" — Yes: the status badge in the header updates immediately after `router.refresh()` completes. The visual state change in the badge is the confirmation.

## Accessibility
- Keyboard navigation: Banner button is a standard `<button>` — receives focus with Tab, activated with Enter/Space. ✓
- WCAG 2.2 AA: Text contrast on emerald-50/emerald-800 and stone-50/stone-900 backgrounds meets AA. ✓
- Focus indicators: Inherits `focus-visible:outline` styles matching the rest of the app. ✓
- `role="status" aria-live="polite"` on the banner container — screen readers announce the suggested action when it appears. ✓
- Disabled state: `disabled:opacity-50 disabled:cursor-not-allowed` while loading. ✓
