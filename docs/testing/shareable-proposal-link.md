# Test Plan: Shareable Deal Proposal Link

## Coverage Baseline
share-token.ts: 100% | share/handlers.ts: 100% | share/index.ts: 100%
deals/handlers.ts: shareProposal + revokeShare covered

## Test Cases
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| generateShareToken format | Unit | 64-char hex | Low |
| generateShareToken uniqueness | Unit | Different per call | Low |
| POST share — success | Integration | 200, token+url | High |
| POST share — unknown deal | Integration | 404 | Medium |
| POST share — no auth | Integration | 401 | High |
| DELETE share — success | Integration | 200, token null | High |
| DELETE share — unknown deal | Integration | 404 | Medium |
| GET /share/:token — success | Integration | 200, proposal view | High |
| GET /share/:token — unknown | Integration | 404 | Medium |
| GET /share/:token — no auth | Integration | 200 (public) | Critical |

## Coverage Target
≥90% on: src/routes/share/, src/lib/share-token.ts, src/routes/deals/handlers.ts
