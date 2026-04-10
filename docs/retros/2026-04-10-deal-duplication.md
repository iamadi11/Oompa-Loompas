# Retro: Deal Duplication
Shipped: 2026-04-10

## What Was Built
`POST /api/v1/deals/:id/duplicate` endpoint + "Duplicate deal" button on the deal detail page.
Clones a deal as DRAFT — same brand, value, deliverables (PENDING), payments (PENDING), notes.
Dates and shareToken cleared. Navigator lands on new deal immediately.

## Decisions Made (and why)
- **Single `deal.create` with nested `createMany`:** atomic, one DB round-trip. No transaction
  wrapper needed since Prisma create+createMany is already atomic.
- **Status always DRAFT:** regardless of source status — creator should restart the lifecycle for
  the new campaign. No override option for Phase 1.
- **Dates cleared:** startDate/endDate are campaign-specific. Copying dates would mislead creators
  into thinking the new campaign has set dates. Reset to null = explicit "fill this in".
- **shareToken not inherited:** the share link is specific to one deal. A copy gets no share link
  by default; creator generates one if needed.
- **Navigate to new deal on success:** creator needs to edit dates and price. Staying on source
  deal would require a separate navigation step. Immediate redirect is the right call.
- **No "(Copy)" rename prompt:** friction. Creator renames on the edit form if needed.

## What the Critic User Said
"One click and I was looking at the new deal. I renamed the title and changed the price — 30
seconds total instead of 5 minutes." Hard part: deciding whether to navigate away or stay. Chose
navigate — the new deal needs immediate editing and the back button brings them back.

## Post-Deploy Baseline
- `POST /api/v1/deals/:id/duplicate` endpoint live ✓
- Browser: "test (Copy)" DRAFT created with cloned deliverable and payment ✓
- Next-action banner fired correctly on new DRAFT ✓
- 228 tests green ✓

## What To Watch
- `POST /api/v1/deals/:id/duplicate` adoption rate (any calls = feature discovered)
- Deals with title ending `(Copy)` as % of all new deals (adoption signal)
- Check at day 7 and day 14

## What We'd Do Differently
- The hook configuration uses `code-review-graph update --quiet` which errors (unrecognized flag).
  Should be fixed: `code-review-graph update` (no `--quiet`). Non-blocking but noisy.
