# Authentication and RBAC

## Purpose

Protect tenant data with **seed-only accounts**, **server-side sessions**, and **role checks** on the API. The web app uses **HTTP-only cookies** and Next.js **rewrites** so the browser treats API calls as same-origin where possible.

## Components

| Layer | Responsibility |
|-------|----------------|
| PostgreSQL | `User`, `Session`, `Deal.userId`, `roles[]` on user |
| API (`apps/api`) | Login/logout/me, session cookie, `authenticate` pre-handler on `/api/v1/*` (except public health + `/api/v1/auth/*` registration order) |
| Web (`apps/web`) | `proxy.ts` gate for workspace routes, `credentials: 'include'` on client fetch, `serverApiFetch` forwards `Cookie` in RSC |

## Session flow

1. `POST /api/v1/auth/login` validates email/password (bcrypt), creates a `Session` row (token hash), sets **HTTP-only** cookie (`SESSION_COOKIE_NAME`, default `oompa_session`) with raw token (HMAC input stored as hash in DB).
2. Browser sends cookie on same-site requests. Client uses relative `/api/v1/...` when `NEXT_PUBLIC_API_URL` is unset so Next rewrites to Fastify and the cookie stays on the web origin.
3. `GET /api/v1/auth/me` returns `{ data: { id, email, roles } }` for the shell.
4. `POST /api/v1/auth/logout` deletes the session row and clears the cookie.

## Environment variables

**API (`apps/api`)**

| Variable | Required (prod) | Notes |
|----------|-------------------|--------|
| `SESSION_SECRET` | Yes | Min 32 characters; used to hash session tokens |
| `SESSION_COOKIE_NAME` | No | Default `oompa_session`; must match web `NEXT_PUBLIC_SESSION_COOKIE_NAME` |
| `SESSION_TTL_DAYS` | No | Default 14; bounds 1–365 |
| `WEB_URL` | Yes (CORS) | Origin of the web app |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | When DB empty | Seed only; never commit real passwords |

**Web (`apps/web`)**

| Variable | Notes |
|----------|--------|
| `API_URL` | Upstream for `next.config` rewrites to Fastify |
| `NEXT_PUBLIC_API_URL` | Optional; if set, client fetch + invoice links use this origin instead of same-origin rewrites |
| `NEXT_PUBLIC_SESSION_COOKIE_NAME` | Optional; must match API cookie name for `proxy` |

## RBAC

- Roles: `ADMIN`, `MEMBER` (see `@oompa/types`).
- Domain routes require authentication and scope data by `deal.userId` (or equivalent).
- **Probe route:** `GET /api/v1/admin/ping` returns **403** unless the user has `ADMIN`.

## Failure modes

| Scenario | Behavior |
|----------|----------|
| Missing/invalid cookie | `401` on protected API routes; web `proxy` redirects to `/login?from=...` |
| Wrong role | `403` on admin-only routes |
| Session expired or revoked | Same as missing cookie |
| `SESSION_SECRET` missing in production | API fails fast at startup (auth env validation) |

## Rollback

Prefer forward fixes. Reverting the Prisma migration is only for non-production databases; production needs a coordinated migration strategy for `Deal.userId`.
