# UX: Brand directory

## User Journey
Deals → **Brands** → scan table → **View deals** → filtered pipeline; **Clear brand filter** returns to unfiltered mode for the same pill (pipeline vs attention).

## States
- **Empty:** explain + Add deal CTA.
- **Error:** API unavailable message + back link.
- **Data:** sortable-by-default table (brand name A–Z from API).

## Critic Feedback
`brandName` filter is contains-match — two similar brands may overlap; acceptable for Phase 1.

## Accessibility
Table uses `scope` on headers and row header for brand name.
