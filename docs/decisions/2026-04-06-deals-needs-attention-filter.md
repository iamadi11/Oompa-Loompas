# Decision: Deals list “needs attention” filter
Date: 2026-04-06
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Add optional query param `needsAttention=true` to `GET /api/v1/deals` returning only deals that have at least one **overdue payment** (past `dueDate`, status not RECEIVED/REFUNDED) or **overdue PENDING deliverable** (past `dueDate`). The web **Deals** page exposes **All deals** vs **Needs attention** toggles; `/attention` links to the filtered list.

## Why Now
Attention queue lists *items*; creators still think in *deals*. Filtering the deal list matches mental triage and matches the same overdue rules as dashboard/attention (no divergent definitions).

## Why Not “Only link from Attention”
Discovery: users land on Deals from nav and search; filter must be visible there without requiring Attention first.

## Why Not a separate `/deals/overdue` route
Query param keeps one canonical deals resource and works with existing pagination meta.

## User Without This Feature
They scroll all deals or cross-reference Attention row-by-row to find which deals need work.

## Success Criteria
- API returns 400 for invalid `needsAttention` values (only `true` / `false`).
- Prisma `where` matches overdue semantics used elsewhere.
- Web filter is keyboard-focusable with visible current state.

## Assumptions (to be validated)
- Creators use the filter when backlog spans many deals.
