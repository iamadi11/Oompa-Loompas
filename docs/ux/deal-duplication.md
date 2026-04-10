# UX: Deal Duplication

## User Journey
1. Creator opens deal detail page for a past campaign (e.g., "Nike Reel Q1")
2. Sees "Duplicate deal" button in the deal actions panel
3. Clicks button → loading state "Duplicating…" (<200ms perceived with optimistic disabled state)
4. API creates copy → browser navigates to new deal detail page `/deals/<new-id>`
5. Creator sees "Nike Reel Q1 (Copy)" in DRAFT status — all deliverables and payments cloned
6. Creator edits title, adjusts dates and value for the new campaign
7. Creator advances deal to NEGOTIATING

## States
- **Zero state**: N/A — button always visible on deal detail
- **Loading state**: button text → "Duplicating…", disabled, opacity-50
- **Success state**: navigation to new deal page (no toast needed — the new deal IS the confirmation)
- **Error state**: inline error below button, actionable text ("Failed to duplicate deal. Try again.")

## Placement
Positioned as its own panel below "Share proposal" on the deal detail page. Mirrors the visual
rhythm of the share panel — same `panelClass` container, same h2 heading style.

## Critic Feedback
**Honest pre-ship assessment:**
- "(Copy)" suffix is ugly but clear. Creator will rename it on the edit form. Acceptable.
- "Why did it take me to a different page?" — Some users may expect to stay on source deal.
  Counter: the new deal needs immediate editing (dates, price). Navigating there is the right call.
  The user can always hit back.
- "I accidentally duplicated it" — Low risk; DRAFT deals are zero-cost. They can delete it.
  No undo needed for Phase 1.

## Accessibility
- Keyboard navigation: button is standard `<button>` — tab-focusable, enter/space activates
- WCAG 2.2 AA: disabled state uses `opacity-50 cursor-not-allowed` (visible)
- Focus indicator: `focus-visible:outline focus-visible:outline-2` consistent with other buttons
- No motion: no animation on this button (action is navigation, not in-page state change)
