# UX: Dashboard priority actions

## User journey
1. Creator opens home (has deals).
2. If anything is overdue, an amber **What to do next** block appears above the summary grid (up to ten items).
3. If more than ten items are overdue, **View all N items** links to `/attention` for the full queue.
4. They tap/click a row → land on deal detail to mark payment received or complete/clear deliverable.

## States
- **Zero state:** Section hidden when `priorityActions` is empty (nothing overdue).
- **Loading:** Same as rest of home (server component fetch).
- **Success:** List of links with short copy (“Chase payment” / “Ship deliverable”), amount or title, relative due phrase.
- **Error:** Unchanged global home error path (API unreachable → empty-state CTA).

## Critic feedback
- Still no one-click “mark received” from home — intentional to keep money actions on the deal screen (network truth, explicit intent).
- Full queue: see [attention-queue.md](./attention-queue.md) (`/attention` + `GET /api/v1/attention`).

## Accessibility
- Section and list use semantic heading + list.
- Links use visible focus ring (brand ring + offset).
- Copy is plain language; no color-only status (text describes action type).

## Verification
- Browser MCP run vs this doc: [docs/testing/browser-ux-checklist-dashboard-priority-actions-2026-04-06.md](../testing/browser-ux-checklist-dashboard-priority-actions-2026-04-06.md)
- Combined run (dashboard + `/attention`): [docs/testing/browser-ux-checklist-attention-queue-2026-04-06.md](../testing/browser-ux-checklist-attention-queue-2026-04-06.md)
