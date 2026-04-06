# Decision: Auth, tenancy, and workspace shell (release 0.2.0)

Date: 2026-04-06  
Phase: 1 — Capture + financial truth (per SOURCE_OF_TRUTH.md)  
Status: **APPROVED (shipped as 0.2.0)**

## What

Ship **session-based authentication**, **per-user deal tenancy**, **RBAC on the API** (with a minimal admin probe), **marketing landing vs authenticated workspace** on the web client, and **documentation + tests** so money paths are not served from an anonymous API.

## Why now

- **Risk:** An open `/api/v1` surface exposes creator financial data; this violates SOT trust and creator outcome goals.
- **Phase fit:** Tenancy and explicit auth are prerequisites for integrations, workflows, and intelligence without cross-user leakage.
- **Simplest viable system:** Server-side sessions + cookie, Prisma `User` / `Session`, `Deal.userId`, seed-only accounts for early environments.

## Why not “JWT in localStorage only”

- XSS exfiltration risk on financial data; HTTP-only cookies with server-side session rows support revocation and align with SameSite/Lax defaults for same-site rewrites.

## Why not “magic link first”

- Higher integration burden (email provider, deliverability) before the core tenancy model exists; seed + login unblocks dev/staging immediately.

## User without this feature

Creators (or anyone who discovered the API URL) could read/write all deals; no per-user boundary, no audit-friendly session story.

## Success criteria

- All domain APIs require a valid session except documented public routes.
- Deals and nested resources are scoped to the authenticated user.
- Web workspace routes redirect unauthenticated users to login; marketing stays public.
- Logout clears the session cookie reliably in supported browsers.
- CI: typecheck, lint, tests green; coverage gates maintained on touched packages.

## Assumptions (to validate)

- Operators set **`SESSION_SECRET`** (≥32 chars) and **`WEB_URL`** correctly in production.
- Migrations run before API traffic on new deploys.
- Post-deploy: monitor 401/403 rates and login failures (see instrumentation doc).
