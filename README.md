# Oompa-Loompas

Monorepo for the **Creator Revenue Intelligence System** — a financial outcome engine for creators (deals, payments, deliverables, dashboard). See [SOURCE_OF_TRUTH.md](./SOURCE_OF_TRUTH.md) for product authority.

## Packages

| Path | Role |
|------|------|
| `apps/web` | Next.js 14 web client ([PWA](./docs/decisions/2026-04-06-pwa-web-client.md)) |
| `apps/api` | Fastify API |
| `packages/db` | Prisma / PostgreSQL |
| `packages/types` | Shared types |

## Web client (PWA)

- **ADR:** [docs/decisions/2026-04-06-pwa-web-client.md](./docs/decisions/2026-04-06-pwa-web-client.md)
- **UX & shell:** [docs/ux/web-shell-pwa.md](./docs/ux/web-shell-pwa.md)
- **Technical:** [docs/architecture/pwa-web-client.md](./docs/architecture/pwa-web-client.md)

## Development

```bash
pnpm install
pnpm dev
```

Use the root and package `package.json` scripts for typecheck, lint, and tests.
