# Release `@oompa/web` **0.2.0** / `@oompa/api` **0.2.0** / `@oompa/db` **0.2.0** / `@oompa/types` **0.2.0** (2026-04-06)

## Summary

Introduces **authentication**, **deal tenancy** (`Deal.userId`), **session cookies**, **RBAC** (admin probe route), a **public marketing home** and **authenticated workspace** (dashboard, deals, attention, admin), and supporting **docs + tests**. Closes the “open API” gap for creator financial data.

## User-visible changes

- **Creators:** Must **sign in** to use the workspace; **landing page** explains the product; **Admin** link appears only for admin roles.
- **Operators:** Configure **`SESSION_*`**, **`WEB_URL`**, and optional **seed admin** env vars; run **migrations** before rolling the API.

## Technical changes

| Area | Detail |
|------|--------|
| DB | `users`, `sessions`, `deals.user_id`, roles; migration `20260407120000_users_sessions_deal_tenancy` |
| API | Auth routes, `authenticate` on protected v1 routes, `clearCookie`/`setCookie` attribute parity |
| Web | `middleware.ts`, `(workspace)` layout, login, `api` client + `serverApiFetch`, deal status transition UI |
| Types | Auth DTOs + `DEAL_STATUS_TRANSITIONS` usage from web |

## Deploy ordering

1. **`pnpm --filter @oompa/db exec prisma migrate deploy`** (or CI equivalent) **before** new API instances serve traffic.  
2. Deploy **API 0.2.0**, then **Web 0.2.0** (or together after DB is migrated).  
3. Set **`SESSION_SECRET`**, **`WEB_URL`**, and production cookie policy; verify **`API_URL`** on the web app for rewrites.

## Verification

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm --filter @oompa/web build
```

Browser: login, CRUD smoke, logout (session cleared), `/offline` still reachable. Log: [docs/testing/ux-checklist-results.md](../testing/ux-checklist-results.md).

## References

- Architecture: [docs/architecture/auth-and-rbac.md](../architecture/auth-and-rbac.md)  
- Decision: [docs/decisions/2026-04-06-auth-tenancy-release-0.2.0.md](../decisions/2026-04-06-auth-tenancy-release-0.2.0.md)  
- Ship gates: [docs/testing/ship-gates-release-0.2.0-2026-04-06.md](../testing/ship-gates-release-0.2.0-2026-04-06.md)
