# UX: Payment milestones CSV export

## User journey
Deals page → **Export payments CSV** → file saves → open in spreadsheet.

## States
Same as deal export: loading label, inline error, silent success.

## Critic feedback
Two export buttons add slight clutter; labels distinguish deals vs payments. Future: single “Export” menu if more formats appear.

## Accessibility
Native button, focus ring, `role="status"` on errors.
