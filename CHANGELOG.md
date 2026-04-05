# Changelog

All notable changes to this repository are documented in this file.

## Unreleased

### CI/CD

- **GitHub Actions**: reusable **`ci-reusable.yml`**, **`ci.yml`** on **`main`**, **`deploy-staging.yml`** (**`staging`** branch + env **`staging`**), **`deploy-production.yml`** (**release** + env **`production`**). See **`infra/README.md`**.

### `@oompa/web`

- **`pnpm dev:clean`** — removes **`.next`** then runs **`next dev -p 3005`** (use with **`API_URL` / `NEXT_PUBLIC_API_URL`** when recovering from **missing chunk** dev **500**s).

## [0.1.5] - 2026-04-06

### `@oompa/web`

- Home **overview** distinguishes **dashboard unavailable** (API/network failure) from **no deals yet**: `resolveHomeOverviewState` in `lib/home-page.ts`, **`OverviewFetchError`** with **Try again** (`router.refresh()`), unit tests in `lib/__tests__/home-page.test.ts`.

## [0.1.4] - 2026-04-06

### `@oompa/web`

- Deals list **document titles** via `generateMetadata`: **`Deals · Revenue`** and **`Needs attention · Revenue`** when the needs-attention filter is active.
- **`isDealsNeedsAttentionFilter`** in `lib/deals-page.ts` (unit-tested) for shared filter parsing.
