# Test Plan: Deliverable Approval Flow

## Coverage Baseline
- API unit tests: 13 new tests in `apps/api/src/__tests__/approvals.test.ts`
- Types unit tests: existing `packages/types/src/__tests__/deliverable.test.ts` updated
- E2E tests: 10 new tests in `apps/e2e/tests/approval.spec.ts`

## Test Cases

| # | Case | Layer | Result |
|---|------|-------|--------|
| 1 | POST share-approval generates 64-char hex token + approvalUrl | API unit | ✓ |
| 2 | POST share-approval is idempotent (returns existing token, no DB write) | API unit | ✓ |
| 3 | POST share-approval returns 404 when deliverable not owned by user | API unit | ✓ |
| 4 | POST share-approval returns 401 when unauthenticated | API unit | ✓ |
| 5 | DELETE share-approval clears token + brandApprovedAt | API unit | ✓ |
| 6 | DELETE share-approval returns 404 when not owned by user | API unit | ✓ |
| 7 | GET /approvals/:token returns approval view with title, dealTitle, brandApprovedAt | API unit | ✓ |
| 8 | GET /approvals/:token returns 404 for unknown token | API unit | ✓ |
| 9 | GET /approvals/:token does not require authentication | API unit | ✓ |
| 10 | POST /approvals/:token sets brandApprovedAt and returns 200 | API unit | ✓ |
| 11 | POST /approvals/:token is idempotent (no DB update if already approved) | API unit | ✓ |
| 12 | POST /approvals/:token returns 404 for unknown token | API unit | ✓ |
| 13 | POST /approvals/:token does not require authentication | API unit | ✓ |
| 14 | Deliverable row shows "Share approval link" button for pending deliverable | E2E | ✓ |
| 15 | Clicking share approval link shows "Copy link" button | E2E | ✓ |
| 16 | After brand approval, row shows "Brand approved" badge | E2E | ✓ |
| 17 | Creator can revoke approval link, row returns to "Share approval link" | E2E | ✓ |
| 18 | Invalid token shows not-found/no-longer-valid message | E2E | ✓ |
| 19 | Valid token shows deliverable title and brand name | E2E | ✓ |
| 20 | Valid token shows "Confirm Approval" CTA | E2E | ✓ |
| 21 | Clicking Confirm Approval shows confirmed/approved state | E2E | ✓ |
| 22 | Already-approved token shows confirmed state on load, no CTA | E2E | ✓ |
| 23 | Approval page has no workspace nav (Attention, Settings links absent) | E2E | ✓ |

## Edge Cases
- Idempotency: generating token twice returns same token, no extra DB write
- Idempotency: approving already-approved deliverable is a no-op
- Revoke clears both `approvalToken` and `brandApprovedAt`
- Public route accessible without auth cookie
- `DeliverableSchema` extended — existing fixtures updated with `approvalToken: null, brandApprovedAt: null`

## Failure Modes Tested
- Unknown/invalid token → 404 on API, "no longer valid" on page
- Unauthenticated creator actions → 401
- Deliverable not owned by requesting user → 404

## Coverage Target
≥90% on changed packages (API handlers, types, web components)
