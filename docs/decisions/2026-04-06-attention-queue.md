# Decision: Attention queue (full overdue list)
Date: 2026-04-06
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Add `GET /api/v1/attention` returning every overdue payment and overdue PENDING deliverable (same rules and sort as the home “What to do next” list, **no -item cap**). Extend `GET /api/v1/dashboard` with `priorityActionsTotalCount` and show **View all N items** on the overview when `N > 10`. New web route `/attention` plus shell nav link **Attention**.

## Why Now
Dashboard priority actions cap at ten to keep the home screen scannable; creators with larger backlogs had no honest path to the rest. This closes the loop with the smallest additive API and a single list page.

## Why Not “Raise the cap on home only”
Would recreate the original problem (wall of links) and weaken “what should I do next” on first paint.

## Why Not “Paginate attention”
No evidence yet that unbounded scroll is a problem; one sorted list matches mental model. Pagination can follow if lists grow past practical render size.

## User Without This Feature
They assume the overview shows everything overdue, miss items 11+, and revert to spreadsheets or memory.

## Success Criteria
- Dashboard exposes total count; overflow link appears when count exceeds shown rows.
- Attention returns the full queue; empty state copy is clear.
- Shared collection logic avoids diverging rules between endpoints.

## Assumptions (to be validated)
- Creators will use `/attention` when the overflow link or nav is visible.
