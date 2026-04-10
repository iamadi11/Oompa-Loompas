# Release 0.3.1 — User Registration

**Date:** 2026-04-09
**Type:** Feature (Phase 1 completion)

## What Shipped

### User Registration
- `POST /api/v1/auth/register` — self-serve registration: validates email + password (min 8 chars), bcrypt-hashes password, creates user with MEMBER role, auto-creates session, sets HTTP-only session cookie, returns 201
- `/register` page — registration form with email, password, confirm password; client-side validation; ARIA-accessible; keyboard-operable; redirects to app on success
- Login page updated with "Don't have an account? Sign up" link to `/register`
- `api.register()` added to web `ApiClient`

### Test / Coverage Fixes
- Fixed stale PWA manifest test (background_color + theme_color expected values updated to dark theme #0A0A0A after v0.3.0 revamp)
- Added `api.test.ts` coverage for `register()`, `shareProposal()`, `revokeShare()`, `paymentInvoiceAbsoluteUrl()`

## Coverage
- API: 94.38% statements, 100% functions
- Web: 98.44% statements, 100% functions

## Breaking Changes
None.

## Migration
None — no schema changes. User model and Session model already existed from v0.2.0.
