# Test Plan: Deal Duplication

## Coverage Baseline
No prior tests for `POST /api/v1/deals/:id/duplicate` (new endpoint).

## Test Cases
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| Duplicate PAID deal → returns 201 with new DRAFT deal | Integration | 201, title "(Copy)", status DRAFT, shareToken null | High |
| Source status is PAID → copy still DRAFT | Integration | status DRAFT in create call | High |
| Source has startDate/endDate → copy clears both | Integration | startDate null, endDate null in create payload | Medium |
| Source has shareToken → copy does NOT inherit it | Integration | shareToken absent from create payload | Medium |
| Deal with no payments/deliverables → 201 | Integration | Success, no nested createMany | Low |
| Source deal not found → 404 | Integration | 404 Not Found | High |
| No auth cookie → 401 | Integration | 401 Unauthorized | High |
| `duplicateDeal` client method → POST correct URL | Unit | fetch called with `/api/v1/deals/:id/duplicate` | Medium |

## Edge Cases
- Empty payments array: skip `payments.createMany` entirely (no empty createMany call)
- Empty deliverables array: same skip pattern
- Source deal belongs to different user: 404 (not 403) — consistent with other deal endpoints
- All payments as RECEIVED: still cloned as PENDING (reset to initial state)
- Deliverable with COMPLETED status: cloned as PENDING (reset)

## Failure Mode Tests
- Deal not found: 404
- Unauthenticated: 401

## Coverage Target
≥90% on:
- `apps/api/src/routes/deals/handlers.ts` — achieved 97.41%
- `apps/web/lib/api.ts` — achieved 96.96%
