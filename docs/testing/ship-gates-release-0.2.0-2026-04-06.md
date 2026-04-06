# Ship gates — release 0.2.0 (2026-04-06)

Autonomous `/ship` verification for **auth, tenancy, workspace shell**.

| # | Gate | Result | Evidence / notes |
|---|------|--------|------------------|
| 1 | **CI parity** | **Pass** | `pnpm typecheck`, `pnpm lint`, `pnpm test` at repo root (run locally before merge). |
| 2 | **Migrations** | **Pass** | `20260407120000_users_sessions_deal_tenancy` forward-only; rollback = non-prod revert only. |
| 3 | **Browser** | **Pass (MCP + spot checks)** | [ux-checklist-results.md](./ux-checklist-results.md) — login, dashboard, deals CRUD smoke, admin, offline. Full `confirm()` deletes + invoice tab: real Chrome. |
| 4 | **Performance** | **N/A budget change** | No new documented LCP/INP regression; web build should succeed in CI. |
| 5 | **Security** | **Pass** | Secrets in env only; session cookie HTTP-only; tenancy on handlers; no broadened data access. |
| 6 | **Tests** | **Pass** | API auth + route tests; web `lib/**` coverage threshold met. |
| 7 | **Observability** | **Documented** | [instrumentation/auth-tenancy-release-0.2.0.md](../instrumentation/auth-tenancy-release-0.2.0.md) |
| 8 | **Versioning** | **Pass** | `CHANGELOG.md` **[0.2.0]**; package bumps: web/api/db/types → **0.2.0**. |
| 9 | **Deploy path** | **Repo standard** | GitHub Actions / documented `pnpm` flows; no ad-hoc production changes from agents. |

## Follow-up (human)

- Production: first deploy after 0.2.0 — watch **401/403** and **login error** rates; confirm **`SESSION_SECRET`** rotation procedure.  
- Optional: structured **audit log** for admin actions (future slice).
