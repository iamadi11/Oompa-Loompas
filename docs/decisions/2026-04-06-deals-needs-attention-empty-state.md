# Decision: Deals “needs attention” empty state

Date: 2026-04-06  
Phase: 1 (Deal + Payment Intelligence)  
Status: APPROVED

## What

When the **Needs attention** filter returns **zero** deals, the list must not show the global **“No deals yet”** empty state. Instead, show **caught-up** copy and links to **all deals** and **overview**.

## Why now

Creators with active deals who filter to overdue work and see “No deals yet” lose trust in the product and may think data failed to load. This is a **risk reduction** fix with no API or schema change.

## Why not “use the same empty component everywhere”

A single empty state optimizes for first-time users only; filtered views need **contextual** copy so “what to do next” stays honest.

## Why not defer until Phase 2

The bug is visible on every “caught up” visit and undermines the attention queue and `/deals?needsAttention=true` journey shipped earlier.

## User without this fix

1. Open **Needs attention** with no overdue items.  
2. Read “No deals yet” and assume the app lost their deals or the filter is broken.  
3. Waste time refreshing or re-adding data.

## Success criteria

- Empty filter shows **You're all caught up** and **View all deals**.  
- Global empty (no deals at all) still shows **No deals yet** and **Add deal**.  
- **Add deal** in the page header remains available when the filter is active (even if the list is empty).

## Assumptions (to be validated)

- Creators prefer a secondary **Back to overview** link on empty list views for orientation.
