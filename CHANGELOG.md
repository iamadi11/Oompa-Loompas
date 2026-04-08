# Changelog

All notable changes to this repository are documented in this file.

## [0.2.2] - 2026-04-09

### `@oompa/web` **0.2.2**

- **Deal pipeline stage strip:** status filter tabs (Draft / Negotiating / Active / Delivered / Paid / Cancelled) with per-status counts on the `/deals` page. Clicking a stage filters the list; all counts computed server-side from a single fetch.

### Documentation

- [Decision](./docs/decisions/2026-04-09-deal-pipeline-stage-strip.md) · [Architecture](./docs/architecture/deal-pipeline-stage-strip.md) · [UX](./docs/ux/deal-pipeline-stage-strip.md) · [Testing](./docs/testing/deal-pipeline-stage-strip.md) · [Instrumentation](./docs/instrumentation/deal-pipeline-stage-strip.md)

## [0.2.1] - 2026-04-08

### `@oompa/types` **0.2.1**

- **Dashboard / attention:** `overdue_payment` priority actions include **`brandName`** for client-side reminder text.

### `@oompa/utils` **0.1.3**

- **`buildPaymentReminderMessage`:** deterministic plain-text follow-up for a payment (optional due line + invoice URL).

### `@oompa/api` **0.2.1**

- **`collectPriorityActionsFromDeals`:** populates **`brandName`** on overdue payment actions.

### `@oompa/web` **0.2.1**

- **Copy reminder** on deal payment rows and overdue payment cards (overview + attention); **`paymentInvoiceAbsoluteUrl`** helper.

### Documentation

- [Decision](./docs/decisions/2026-04-08-payment-reminder-copy.md) · [Release](./docs/releases/RELEASE-0.2.1.md)

## [0.2.0] - 2026-04-06

### `@oompa/types` **0.2.0**

- **Auth contracts:** `Role`, `AuthUser`, `LoginBody`, `MeResponse`, Zod schemas; `DEAL_STATUS_TRANSITIONS` consumed by the web deal form for **valid status edits**.

### `@oompa/db` **0.2.0**

- **Tenancy:** `User`, `Session`, `Deal.userId`, roles; migration [`20260407120000_users_sessions_deal_tenancy`](./packages/db/prisma/migrations/20260407120000_users_sessions_deal_tenancy/migration.sql).
- **`db:seed`:** [`packages/db/src/seed.ts`](./packages/db/src/seed.ts) — idempotent (skips when any deal exists); **`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`** required when seeding an empty DB.

### `@oompa/api` **0.2.0**

- **Auth:** `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`; HTTP-only session cookie; **`clearCookie` attributes match `setCookie`** (logout reliably clears session).
- **Guards:** Authenticated **`/api/v1/*`** (except public health + auth routes); domain handlers scoped by **`userId`** / deal ownership.
- **RBAC probe:** `GET /api/v1/admin/ping` (**ADMIN** only).
- **Env:** `SESSION_SECRET`, `SESSION_COOKIE_NAME`, `SESSION_TTL_DAYS`, seed vars — see [`apps/api/.env.example`](./apps/api/.env.example).

### `@oompa/web` **0.2.0**

- **Marketing vs app:** `/` landing; **`(workspace)`** shell for `/dashboard`, `/deals`, `/attention`, `/admin`; **`middleware.ts`** session gate + redirects.
- **Login** and **RBAC UI** (Admin / Log out via `/me`); **Next rewrites** `/api/v1/*` → Fastify; client **`credentials: 'include'`**; **`serverApiFetch`** forwards cookies for RSC.
- **Deal form (edit):** status dropdown limited to **allowed transitions** (matches API rules).
- **UX:** `scroll-padding-top` on `html` for sticky shell; invoice links via **`paymentInvoiceHref`**.

### Documentation / process

- [Auth & RBAC](./docs/architecture/auth-and-rbac.md), [docs README](./docs/README.md), [UX checklist run](./docs/testing/ux-checklist-results.md).
- **Release:** [RELEASE-0.2.0.md](./docs/releases/RELEASE-0.2.0.md) · **Decision:** [2026-04-06-auth-tenancy-release-0.2.0.md](./docs/decisions/2026-04-06-auth-tenancy-release-0.2.0.md) · **Ship gates:** [ship-gates-release-0.2.0-2026-04-06.md](./docs/testing/ship-gates-release-0.2.0-2026-04-06.md) · **Instrumentation:** [auth-tenancy-release-0.2.0.md](./docs/instrumentation/auth-tenancy-release-0.2.0.md) · **Retro:** [2026-04-06-auth-tenancy-release-0.2.0.md](./docs/retros/2026-04-06-auth-tenancy-release-0.2.0.md)

## [0.1.9] - 2026-04-06

### `@oompa/api` **0.1.4**

- **Payment invoice:** sequential **`INV-########`** assigned on **first GET**, persisted on **`payments.invoice_number`** with **`invoice_counters`** and a transactional **`FOR UPDATE`** on the payment row. Optional **`INVOICE_DOCUMENT_LABEL`**, **`INVOICE_ISSUER_*`**, **`INVOICE_PLACE_OF_SUPPLY`** (see [`apps/api/.env.example`](./apps/api/.env.example)). **Docs:** [architecture](./docs/architecture/payment-invoice-html-v1.md) (updated), [decision amendment](./docs/decisions/2026-04-06-payment-invoice-html-v1.md), [instrumentation](./docs/instrumentation/payment-invoice-html-v1.md).

### `@oompa/db` **0.1.1**

- **Migration** [`20260406120000_invoice_counter_and_number`](./packages/db/prisma/migrations/20260406120000_invoice_counter_and_number/migration.sql): **`invoice_counters`**, unique **`payments.invoice_number`**.

### `@oompa/utils` **0.1.2**

- **`buildPaymentInvoiceHtml`:** structured printable layout (issuer / customer, line items, totals, compliance), **toolbar** script (print, copy link, Web Share, download HTML), exported **`PaymentInvoiceIssuerInput`**.

**Release notes:** [docs/releases/RELEASE-0.1.9.md](./docs/releases/RELEASE-0.1.9.md) · **Retro:** [docs/retros/2026-04-06-payment-invoice-sequencing-and-issuer.md](./docs/retros/2026-04-06-payment-invoice-sequencing-and-issuer.md) · **Ship gates:** [docs/testing/ship-gates-release-0.1.9-2026-04-06.md](./docs/testing/ship-gates-release-0.1.9-2026-04-06.md)

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
