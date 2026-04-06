# Oompa-Loompas

Monorepo for **Oompa Loompas**, the creator **financial outcome engine** (deals, payments, deliverables, dashboard). Product behavior and authority are defined in [SOURCE_OF_TRUTH.md](./SOURCE_OF_TRUTH.md).

## Packages

| Path             | Role                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| `apps/web`       | Next.js web client ([PWA](./docs/decisions/2026-04-06-pwa-web-client.md)) |
| `apps/api`       | Fastify API                                                               |
| `packages/db`    | Prisma / PostgreSQL                                                       |
| `packages/types` | Shared types                                                              |

## Web client (PWA)

- **ADR:** [docs/decisions/2026-04-06-pwa-web-client.md](./docs/decisions/2026-04-06-pwa-web-client.md)
- **UX & shell:** [docs/ux/web-shell-pwa.md](./docs/ux/web-shell-pwa.md)
- **Technical:** [docs/architecture/pwa-web-client.md](./docs/architecture/pwa-web-client.md)

## Product planning

- **Next feature candidates (research):** [docs/product/feature-candidates-2026-04.md](./docs/product/feature-candidates-2026-04.md)
- **Release notes index:** [docs/releases/README.md](./docs/releases/README.md)

## Development

```bash
pnpm install
pnpm dev
```

The web app uses **Next.js 16** with **webpack** for dev and build (required for `@ducanh2912/next-pwa`). `apps/web` scripts already pass `--webpack`.

Point the browser at the API from `apps/web` (rewrites `/api/v1/*`): set **`API_URL`** for the Next server to proxy API routes. **Do not set `NEXT_PUBLIC_API_URL` for normal local dev** — the browser client must call same-origin `/api/v1` so the session cookie is stored for the web host (see `apps/web/.env.example`). Example:

```bash
pnpm --filter @oompa/api dev
cd apps/web && API_URL=http://127.0.0.1:3001 pnpm dev
```

Use the root and package `package.json` scripts for typecheck, lint, and tests. UX / PWA checklist runs are logged in [docs/testing/ux-checklist-results.md](./docs/testing/ux-checklist-results.md).

For a **fresh database**, apply migrations (`pnpm --filter @oompa/db exec prisma migrate deploy`) and seed or create a user (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` when there are no deals). See `apps/api/.env.example` and `docs/architecture/auth-and-rbac.md`.
