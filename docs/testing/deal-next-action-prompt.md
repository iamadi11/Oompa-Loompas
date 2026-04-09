# Test Plan: Deal Next-Action Prompt

## Coverage Baseline
Pre-existing `@oompa/types` coverage was 100% before this work. `apps/web` was ≥90%.

## Test Cases
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| DRAFT deal → suggests NEGOTIATING | Unit | targetStatus = NEGOTIATING | Medium |
| NEGOTIATING deal → suggests ACTIVE | Unit | targetStatus = ACTIVE | Medium |
| ACTIVE + 0 deliverables → suggests DELIVERED | Unit | targetStatus = DELIVERED | Medium |
| ACTIVE + all COMPLETED → suggests DELIVERED | Unit | targetStatus = DELIVERED | High |
| ACTIVE + all COMPLETED + some CANCELLED → suggests DELIVERED | Unit | targetStatus = DELIVERED | High |
| ACTIVE + all CANCELLED → suggests DELIVERED | Unit | targetStatus = DELIVERED | Medium |
| ACTIVE + PENDING deliverable → null | Unit | null | High |
| DELIVERED + 0 payments → suggests PAID | Unit | targetStatus = PAID | Medium |
| DELIVERED + all RECEIVED → suggests PAID | Unit | targetStatus = PAID | High |
| DELIVERED + RECEIVED + REFUNDED → suggests PAID | Unit | targetStatus = PAID | Medium |
| DELIVERED + all REFUNDED → suggests PAID | Unit | targetStatus = PAID | Low |
| DELIVERED + PENDING payment → null | Unit | null | High |
| DELIVERED + PARTIAL payment → null | Unit | null | High |
| DELIVERED + OVERDUE payment → null | Unit | null | High |
| PAID deal → null | Unit | null | Medium |
| CANCELLED deal → null | Unit | null | Medium |
| Action has label + description strings | Unit | typeof string, length > 0 | Low |

## Edge Cases
- All deliverables CANCELLED (vacuously "all done"): suggests DELIVERED ✓
- All payments REFUNDED (vacuously "all received"): suggests PAID ✓
- Mixed COMPLETED + CANCELLED: suggests DELIVERED ✓
- Mixed RECEIVED + REFUNDED: suggests PAID ✓
- Single PENDING deliverable blocks ACTIVE → DELIVERED ✓

## Failure Mode Tests
- API 409 (invalid transition): error displayed inline, button re-enabled
- Network error: error displayed inline, button re-enabled
- Double-submit prevention: button disabled while `loading === true`

## Coverage
`computeDealNextAction` in `packages/types/src/deal.ts`: **100% branch coverage** (30 tests, all cases covered including all switch branches and both conditions for ACTIVE and DELIVERED).

`DealNextActionBanner` in `apps/web` is a React client component — not unit-tested (integration/browser validated per §7.5). Covered by real-browser validation: DELIVERED → PAID transition confirmed with `PATCH → 200 OK`.
