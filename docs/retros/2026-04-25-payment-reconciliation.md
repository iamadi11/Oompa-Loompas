# Retro: Payment Reconciliation (v0.5.5)

## What was built
CSV-driven payment reconciliation: upload/paste bank statement → auto-match credit rows to pending payments → bulk-mark RECEIVED. Entry point: "Reconcile from bank →" on /attention.

## Decisions + why

**Greedy matching, not optimal assignment.** Greedy (sort by confidence DESC, take first available payment per transaction) is O(n·m) and deterministic. Optimal assignment (Hungarian algorithm) would be O(n³) with no measurable benefit for typical creator workloads (≤20 payments, ≤100 CSV rows).

**5% amount tolerance + LOW confidence band.** Creators receive round-number payments from brands; bank CSS occasionally shows TDS deductions or rounding. 5% catches these without producing false positives at typical invoice values (25k–200k INR → 1,250–10,000 INR tolerance is humanly reviewable).

**Review step is mandatory.** No silent auto-apply. Every match requires explicit checkbox selection before apply. LOW-confidence matches default to deselected. This preserves creator trust on money-adjacent actions.

**`take: 200` in DB query with `dueDate: 'asc'` ordering.** Fixed the core test pollution bug: test data accumulation caused freshly-created payments to fall outside the 200-row window. Fix: `afterEach` cleanup in E2E spec.

**Concurrent `Promise.all` for apply.** Each approval is an independent `updateMany` scoped to one paymentId + userId. Running them concurrently cuts latency linearly. No ordering dependency.

## Critic feedback incorporated
- Editable "received on" date per row: some bank statements show settlement date, not transfer date.
- "Mark 0 payments received" button disabled until ≥1 row selected — avoids accidental no-op apply.
- Redirect to /attention post-apply + success toast — creator immediately sees the updated overdue count.

## Post-deploy baseline
- `POST /api/v1/reconcile/match` calls: 0 (pre-launch)
- `POST /api/v1/reconcile/apply` calls: 0
- Payments marked RECEIVED via reconcile: 0

## What to watch (first 14 days)
- Any 4xx/5xx on `/api/v1/reconcile/*` (CSV parse failures from unexpected bank formats)
- `match` calls with 0 matches returned (indicates CSV format mismatch or brand-name mismatch)
- Session completion rate: `apply` / `match` — low rate = review step friction

## What to do differently
- E2E no-match tests used `99999` as the "unmatchable" CSV amount. A stale DB payment of `99000` (from a previous test run) matched within 5% tolerance, breaking CI. Changed to `3` (₹3 is unmatchable by any realistic payment). Future tests: use amounts < ₹100 or > ₹10M for "no match" scenarios to avoid stale-data false positives.
- `parseCurrencyString` from `@oompa/utils` was already available — caught during simplify review, eliminated a duplicate `parseAmount` function.
