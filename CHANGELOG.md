# Changelog

All notable changes to this repository are documented in this file.

## Unreleased

_Nothing yet — see **[0.1.6]** and [docs/product/feature-candidates-2026-04.md](./docs/product/feature-candidates-2026-04.md)._

## [0.1.6] - 2026-04-06

### Documentation

- **Product research / backlog:** [docs/product/feature-candidates-2026-04.md](./docs/product/feature-candidates-2026-04.md).
- **Release bundle:** [docs/releases/RELEASE-0.1.6.md](./docs/releases/RELEASE-0.1.6.md), [docs/decisions/2026-04-06-release-0.1.6.md](./docs/decisions/2026-04-06-release-0.1.6.md), [docs/instrumentation/release-0.1.6.md](./docs/instrumentation/release-0.1.6.md), [docs/retros/2026-04-06-release-0.1.6.md](./docs/retros/2026-04-06-release-0.1.6.md).

### `@oompa/web`

- **Home — overview unavailable (a11y):** `OverviewFetchError` **`section`** with **`aria-labelledby` / `aria-describedby`**, **`aria-live="polite"`**, **`aria-busy`** while retrying; UX + [browser MCP checklist](./docs/testing/browser-ux-checklist-home-overview-unavailable-2026-04-06.md).

### Tooling / CI

- **GitHub Actions**: reusable **`ci-reusable.yml`**, **`ci.yml`** on **`main`**, **`deploy-staging.yml`**, **`deploy-production.yml`**. See **`infra/README.md`**.
- **`pnpm dev:clean`** (in `apps/web`) — removes **`.next`** then runs **`next dev -p 3005`** (use with **`API_URL` / `NEXT_PUBLIC_API_URL`** when recovering from **missing chunk** dev **500**s).

## [0.1.5] - 2026-04-06

### `@oompa/web`

- Home **overview** distinguishes **dashboard unavailable** (API/network failure) from **no deals yet**: `resolveHomeOverviewState` in `lib/home-page.ts`, **`OverviewFetchError`** with **Try again** (`router.refresh()`), unit tests in `lib/__tests__/home-page.test.ts`.

## [0.1.4] - 2026-04-06

### `@oompa/web`

- Deals list **document titles** via `generateMetadata`: **`Deals · Revenue`** and **`Needs attention · Revenue`** when the needs-attention filter is active.
- **`isDealsNeedsAttentionFilter`** in `lib/deals-page.ts` (unit-tested) for shared filter parsing.
