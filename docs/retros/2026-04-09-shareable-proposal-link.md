# Retro: Shareable Deal Proposal Link
Shipped: 2026-04-09

## What Was Built
A creator can generate a cryptographically random public URL for any deal. The link renders a read-only proposal page (title, value, deliverables, payments) with no login required. The token can be revoked instantly. Three API endpoints + one public web page + one client component.

## Decisions Made (and why)
- **Public route outside `oompaProtectedV1`:** mirrors the health/auth pattern — no hook override, clean separation.
- **RSC for `/p/[token]`:** server-rendered so brands get fast load with no flash; better for WhatsApp link previews.
- **`serializeDeal` returns `shareToken`:** necessary so the client component can show the active-state (URL input) without an extra round-trip on mount.
- **Token from `randomBytes(32).hex`:** 256-bit entropy, no external dependency, URL-safe.

## What the Critic User Said
"Why is it still showing Generate after I clicked?" — The prod build was serving stale JS that didn't include `shareToken` in the serialized deal. Fixed by adding `shareToken` to `serializeDeal` and rebuilding.

## Post-Deploy Baseline
- `/p/:token` route confirmed rendering in prod build
- API returns correct `shareUrl` pointing to `/p/<token>`
- No auth required to load public page (validated in test + browser)

## What To Watch
- GET /api/v1/share/:token 404 rate (would indicate revoked links being shared)
- POST /api/v1/deals/:id/share adoption within first week

## What We'd Do Differently
- Ship `shareToken` in `serializeDeal` from the start rather than discovering it missing during UX validation.
