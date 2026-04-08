# Architecture: Shareable Deal Proposal Link

## Module: Deal

## Data Flow
POST /:id/share → authenticate → findUnique(id+userId) → randomBytes(32).hex → update(shareToken) → return {shareToken, shareUrl}
DELETE /:id/share → authenticate → findUnique(id+userId) → update(shareToken: null)
GET /api/v1/share/:token → NO auth → findUnique(shareToken) → return DealProposalView

## Data Model Changes
- `deals.share_token VARCHAR(64) UNIQUE NULL` — added via migration `20260409000000_add_deal_share_token`
- Retention: token cleared on revoke; cascades deleted with deal

## API Contract
- POST /api/v1/deals/:id/share → 200 {data: {shareToken, shareUrl}} | 401 | 404
- DELETE /api/v1/deals/:id/share → 200 {data: {shareToken: null}} | 401 | 404
- GET /api/v1/share/:token → 200 {data: DealProposalView} | 404

## Events
Emits: none
Consumes: none

## Scale Analysis
Token lookups hit the UNIQUE index on share_token — O(1). No caching needed at current scale.

## Tech Choices
| Choice | Alternatives | Why This |
|--------|-------------|----------|
| randomBytes(32).hex | UUID, nanoid | Crypto-random, 256-bit entropy, no dependencies |
| Public route outside oompaProtectedV1 | Separate auth plugin | Mirrors health/auth pattern; no hook override needed |
| RSC for /p/[token] | Client fetch | Server renders for SEO, no flash of loading state |

## Operational Design
Standard deploy. No infra changes. Revoke is instant (DB update).
