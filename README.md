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

The web app uses **Next.js 16** with the **default Turbopack** pipeline (`next dev`, `next build`). PWA is implemented with **Serwist** (`@serwist/turbopack`): worker source in `apps/web/app/sw.ts`, service worker URL **`/serwist/sw.js`**. Registration stays **off in development** for predictable fast refresh.

Point the browser at the API from `apps/web` (rewrites `/api/v1/*`): set **`API_URL`** for the Next server to proxy API routes. **Do not set `NEXT_PUBLIC_API_URL` for normal local dev** — the browser client must call same-origin `/api/v1` so the session cookie is stored for the web host (see `apps/web/.env.example`). Example:

```bash
pnpm --filter @oompa/api dev
cd apps/web && API_URL=http://127.0.0.1:3001 pnpm dev
```

Use the root and package `package.json` scripts for typecheck, lint, and tests. UX / PWA checklist runs are logged in [docs/testing/ux-checklist-results.md](./docs/testing/ux-checklist-results.md).

### Workspace skeletons ([boneyard-js](https://github.com/0xGF/boneyard))

Route-level `loading.tsx` under `apps/web/app/(workspace)/` uses pre-captured bones in [`apps/web/bones/`](./apps/web/bones/). Regenerate after changing capture fixtures or layout:

1. `pnpm --filter @oompa/web build && pnpm --filter @oompa/web start -p 3020` (use a free port if needed).
2. In another shell: `BONEYARD_BASE_URL=http://127.0.0.1:3020 pnpm --filter @oompa/web bones:build` (default base is `http://127.0.0.1:3020`).

Capture routes (noindex) live under `/boneyard-capture/*`. **Production `next start`** is required for a faithful capture; `next dev` often produces empty layout metrics for the CLI.

For a **fresh database**, apply migrations (`pnpm --filter @oompa/db exec prisma migrate deploy`) and seed or create a user (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` when there are no deals). See `apps/api/.env.example` and `docs/architecture/auth-and-rbac.md`.
