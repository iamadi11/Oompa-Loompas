# UX: Attention queue

## User journey
1. From overview, user sees up to ten priority rows; if more exist, **View all N items** goes to `/attention`.
2. From any screen, **Attention** in the main nav opens the full queue (or “caught up” empty state).
3. Each row links to the deal detail to resolve money or deliverable work.

## States
- **Empty:** “You are caught up” + link back to overview.
- **Error (API down):** Short message + back link.
- **Has items:** Title “Needs your attention”, count subtitle, full list (most overdue first).

## Accessibility
- Reuses `PriorityActionList` with `role="list"` on the `ul`.
- Nav link uses same focus ring pattern as Deals.
- Page H1 is described by the count line (`aria-describedby`); the queue sits in a **section** with an sr-only **H2** (“Overdue items”).

## Verification
- Browser MCP checklist: [docs/testing/browser-ux-checklist-attention-queue-2026-04-06.md](../testing/browser-ux-checklist-attention-queue-2026-04-06.md)
