# Changelog

All notable changes to this repository are documented in this file.

## Unreleased

### `@oompa/db`

- **`db:seed`:** implement [`packages/db/src/seed.ts`](./packages/db/src/seed.ts) (idempotent: skips when any deal exists). Fixes broken **`pnpm db:seed`** script that pointed at a missing file.

## [0.1.8] - 2026-04-06

### `@oompa/api` **0.1.3**

- **Dev CORS:** allow **`http://localhost:3005`** and **`http://127.0.0.1:3005`** alongside existing localhost origins so client-side **`fetch`** from **`pnpm dev:clean`** (`apps/web`) receives **`Access-Control-Allow-Origin`**. Regression test in [`cors.test.ts`](./apps/api/src/__tests__/cors.test.ts). **Docs:** [decision](./docs/decisions/2026-04-06-api-cors-dev-web-3005.md), [architecture](./docs/architecture/api-cors-dev-web-3005.md), [testing](./docs/testing/api-cors-dev-web-3005.md), [instrumentation](./docs/instrumentation/api-cors-dev-web-3005.md), [retro](./docs/retros/2026-04-06-release-0.1.8.md), [release notes](./docs/releases/RELEASE-0.1.8.md).

### `@oompa/web` **0.1.8**

- **Payment invoice UX (a11y):** **View invoice** link **focus-visible** ring. Browser checklist: [docs/testing/browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md](./docs/testing/browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md).

### `@oompa/utils` **0.1.1**

- **Payment invoice HTML (a11y):** **`main`** landmark, table **`aria-label`**, human-readable **payment status** labels (see [UX: payment invoice HTML v1](./docs/ux/payment-invoice-html-v1.md)).

## [0.1.7] - 2026-04-06

### `@oompa/api` **0.1.2**

- **`GET /api/v1/health`** — versioned liveness probe with **`{ data: { status, service }, meta: { timestamp } }`**; **`GET /health`** unchanged. Tests in [`apps/api/src/__tests__/health.test.ts`](./apps/api/src/__tests__/health.test.ts); CORS coverage in [`cors.test.ts`](./apps/api/src/__tests__/cors.test.ts).
- **`GET /api/v1/deals/:dealId/payments/:paymentId/invoice`** — printable **HTML** invoice for one payment milestone (`text/html`, **`Cache-Control: no-store`**). **Docs:** [decision](./docs/decisions/2026-04-06-payment-invoice-html-v1.md), [architecture](./docs/architecture/payment-invoice-html-v1.md), [UX](./docs/ux/payment-invoice-html-v1.md), [testing](./docs/testing/payment-invoice-html-v1.md), [instrumentation](./docs/instrumentation/payment-invoice-html-v1.md), [retro](./docs/retros/2026-04-06-payment-invoice-html-v1.md).
- **Health docs:** [decision](./docs/decisions/2026-04-06-api-v1-health.md), [architecture](./docs/architecture/api-v1-health.md), [UX](./docs/ux/api-v1-health.md), [testing](./docs/testing/api-v1-health.md), [instrumentation](./docs/instrumentation/api-v1-health.md), [retro](./docs/retros/2026-04-06-api-v1-health.md), [browser checklist](./docs/testing/browser-ux-checklist-api-v1-health-2026-04-06.md).

### `@oompa/web` **0.1.7**

- **Deal payments:** **View invoice** link (new tab) using **`PUBLIC_API_BASE_URL`**; **`aria-label`** on the link. Release notes: [docs/releases/RELEASE-0.1.7.md](./docs/releases/RELEASE-0.1.7.md).

### `@oompa/utils`

- **`escapeHtml`**, **`buildPaymentInvoiceHtml`** — shared deterministic invoice body for the API.

### CI / process

- **Reusable workflow:** **`rm -rf apps/web/.next`** before **`pnpm build`** ([`ci-reusable.yml`](./.github/workflows/ci-reusable.yml)).
- **Ship gate log:** [docs/testing/ship-gates-2026-04-06.md](./docs/testing/ship-gates-2026-04-06.md).

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
