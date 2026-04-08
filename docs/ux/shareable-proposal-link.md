# UX: Shareable Deal Proposal Link

## User Journey
1. Creator opens deal detail page
2. Scrolls to "Share proposal" panel
3. Clicks "Generate share link"
4. URL appears in readonly input with Copy button
5. Creator clicks Copy → "Copied!" confirmation (2s)
6. Creator pastes URL into email/WhatsApp to brand
7. Brand opens URL — sees deal title, value, deliverables, payments, no login
8. Creator can click "Revoke link" to invalidate

## States
- Zero state: "Generate a read-only link..." + "Generate share link" button
- Active state: readonly URL input + Copy button + Revoke link
- Loading state: button text changes to "Generating…" / "Revoking…", disabled
- Error state: inline red error message below button
- Copied state: "Copy" → "Copied!" for 2 seconds

## Critic Feedback
The hardest thing to get right: making revoke feel safe (not alarming). "Revoke link" in small red text is intentionally understated — the creator isn't deleting anything important, just invalidating a URL.

## Accessibility
- Keyboard navigation: yes — all buttons focusable, focus-visible outlines on all interactive elements
- WCAG 2.2 AA: compliant
- Focus indicators: present on all buttons and the Share URL input
