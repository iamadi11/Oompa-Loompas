# Retro: Deliverable Approval Flow

**Date:** 2026-04-17  
**Phase:** 1.5 (Phase 2 infrastructure-free)  
**Status:** Shipped

## What Built
Token-gated brand approval loop for deliverables:
- `POST /deals/:id/deliverables/:id/share-approval` — generates 64-char hex token (idempotent)
- `DELETE /deals/:id/deliverables/:id/share-approval` — revokes token + clears approval
- `GET /api/v1/approvals/:token` — public read (no auth required)
- `POST /api/v1/approvals/:token` — brand submits approval (idempotent)
- `/a/[token]` public Next.js page — brand-facing approval view outside workspace nav
- DeliverableRow: "Share approval link" → "Copy link" + "Revoke" state machine + "Brand approved" badge

## Decisions + Why
- Reused `generateShareToken()` from proposal link — no new token infra
- `/a/[token]` mirrors `/p/[token]` proposal route pattern exactly
- DB columns nullable — zero migration risk for existing deliverables
- Approval is idempotent — second POST is a no-op (no race conditions)

## E2E Lessons
Three locator bugs caught by tests:
1. `navigator.clipboard.writeText()` fails in headless Playwright → moved `onUpdate()` before clipboard call
2. `getByRole('button', { name: /copy link/i })` doesn't match `aria-label="Copy approval link for ..."` — fixed with `locator('button', { hasText: 'Copy link' })`
3. `.or()` compound locator + deliverable titled "Revoke Reel" → `getByRole` matched "Mark Revoke Reel as complete" via accessible name, `.first()` picked wrong button — fixed with `hasText: /^Revoke$/` only

## Post-Deploy Baseline
- `approvalToken` count: 0 (new feature)
- `brandApprovedAt` count: 0 (new feature)

## What to Watch
- `brandApprovedAt` set within 72h of token generation → measure conversion rate in 30 days
- Any 404 errors on `/api/v1/approvals/:token` route (broken links shared with brands)

## What to Do Differently
- Test deliverable names should NOT match button text/labels (e.g., avoid "Revoke Reel" as test data)
- Clipboard-dependent flows: always separate clipboard call from state-update calls
