# UX: Attention queue CSV export

## User Journey
1. Open **Attention** when overdue items exist.
2. Tap **Export queue CSV**; file downloads.
3. Open in Excel/Sheets for follow-up or sharing.

## States
- **Empty / caught up:** no export control (nothing to export).
- **Error loading page:** unchanged; no export.
- **Export failure:** inline error under the button; user can retry.

## Critic Feedback
Users with zero items cannot export an empty template — acceptable; header-only export exists if they hit the API directly.

## Accessibility
Button matches other export controls: visible focus ring, disabled state while loading.
