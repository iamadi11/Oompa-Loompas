# Architecture: PWA / web client

**Authority:** SOURCE_OF_TRUTH.md §7.8  
**ADR:** [docs/decisions/2026-04-06-pwa-web-client.md](../decisions/2026-04-06-pwa-web-client.md)

## Components

| Piece | Location / mechanism |
|-------|----------------------|
| Manifest | `apps/web/app/manifest.ts` (Next.js App Router metadata convention) |
| Icons | `apps/web/public/icons/` — PNG, maskable-safe (e.g. 192, 512) |
| Root metadata | `apps/web/app/layout.tsx` — `themeColor`, `appleWebApp`, `icons` as needed |
| Service worker | Generated into `public/` via `@ducanh2912/next-pwa` wrapped in `next.config.mjs` |
| Offline UI | `apps/web/app/offline/page.tsx` — linked from SW fallback / navigation failure |

## Service worker

- **Development:** SW generation disabled so dev servers behave normally.
- **Production:** Precaches the app shell and static assets per the PWA plugin defaults, with **additional runtime rules** keeping `/api/*` on **network-only** (no cache-first financial data).

## HTTPS

PWAs require a **secure context** in production. See [infra/README.md](../../infra/README.md) for deployment and TLS expectations.

## Failure modes

| Failure | Expected behavior |
|---------|-------------------|
| SW registration fails | App remains usable as a normal website; install may be unavailable on some browsers |
| User offline on a data route | Offline page or explicit error; no silent use of old API payloads as truth |

## Related UX

- [docs/ux/web-shell-pwa.md](../ux/web-shell-pwa.md)
