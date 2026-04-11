# Changelog

All notable changes to this repository are documented in this file.

## [0.4.7] - 2026-04-12

### `@oompa/db` **0.2.1**

- **`PushSubscription` model:** stores browser push subscription endpoint, `p256dh`, and `auth` keys per user. Migration `20260411210633_push_subscriptions` applied.

### `@oompa/api` **0.4.7**

- **`GET /api/v1/push/public-key`:** returns VAPID public key (authenticated).
- **`POST /api/v1/push/subscribe`:** upserts a push subscription for the current user.
- **`DELETE /api/v1/push/unsubscribe`:** removes a push subscription by endpoint.
- **Push cron job** (`apps/api/src/jobs/push-notifications.ts`): daily at 01:30 UTC, sends a single bundled push notification per user for overdue payments + deliverables (SOT §25.2 — no monetary amounts in payload, max 3 notifications/day).

### `@oompa/web` **0.4.7**

- **Service worker** (`app/sw.ts`): `push` and `notificationclick` event handlers added — surfaces OS-level notifications and focuses/opens the app on click.
- **`/settings`** page: opt-in UI; requests browser permission, subscribes via API.

### Documentation

- `docs/architecture/pwa-push-notifications.md` — architecture spec.
- `docs/decisions/2026-04-11-pwa-push-notifications.md` — ADR.
- `docs/testing/pwa-push-notifications.md` — test plan.
- `docs/instrumentation/pwa-push-notifications.md` — instrumentation plan.

---

## [0.4.6] - 2026-04-11

### `@oompa/types` **0.2.6**

- **`DealBrandSummary`:** adds **`contractedTotals`** `{ currency, amount }[]` (sums per currency; no cross-currency mixing). **`DealBrandContractedTotalSchema`** exported.

### `@oompa/api` **0.4.6**

- **`GET /api/v1/deals/brands`:** `groupBy` on `brandName` + `currency` with `_sum` of deal value; response rows merged by brand with sorted currency segments.

### `@oompa/web` **0.4.6**

- **`/deals/brands`** brand directory table (deals count, contracted per currency, link to filtered deals).
- **Deals list:** honors **`?brandName=`** on server fetch; **Pipeline / Needs attention** pills and **DealPipelineStrip** preserve brand query; **Clear brand filter** + document title when filtered.

### Documentation

- [Decision](./docs/decisions/2026-04-11-brand-directory.md) · [Architecture](./docs/architecture/brand-directory.md) · [UX](./docs/ux/brand-directory.md) · [Testing](./docs/testing/brand-directory.md) · [Instrumentation](./docs/instrumentation/brand-directory.md) · [Release](./docs/releases/RELEASE-0.4.6.md) · [Retro](./docs/retros/2026-04-11-brand-directory.md)

## [0.4.5] - 2026-04-11

### `@oompa/utils` **0.2.3**

- **`buildAttentionQueueCsv` / `attentionQueueExportFilename` / `AttentionQueueCsvRow`:** CSV for overdue payments and deliverables (same sort as GET /attention).

### `@oompa/api` **0.4.5**

- **`GET /api/v1/attention/export`:** authenticated CSV of the full attention queue (BOM + attachment `oompa-attention-queue-YYYY-MM-DD.csv`). Rows capped at 5,000; `brand_name` filled for deliverable rows from the parent deal.

### `@oompa/web` **0.4.5**

- **`ExportAttentionCsvButton`** on the attention queue page when items exist; **`api.downloadAttentionQueueCsv()`**.

### Documentation

- [Decision](./docs/decisions/2026-04-11-attention-queue-csv-export.md) · [Architecture](./docs/architecture/attention-queue-csv-export.md) · [UX](./docs/ux/attention-queue-csv-export.md) · [Testing](./docs/testing/attention-queue-csv-export.md) · [Instrumentation](./docs/instrumentation/attention-queue-csv-export.md) · [Release](./docs/releases/RELEASE-0.4.5.md) · [Retro](./docs/retros/2026-04-11-attention-queue-csv-export.md)

## [0.4.4] - 2026-04-11

### `@oompa/types` **0.2.5**

- **`DealBrandSummarySchema` / `DealBrandSummary`:** `{ brandName, dealCount }` for distinct-brand API responses.

### `@oompa/api` **0.4.4**

- **`GET /api/v1/deals/brands`:** session-scoped distinct `brandName` values with deal counts, ascending by name (Prisma `groupBy`). Registered before `/:id`.

### `@oompa/web` **0.4.4**

- **`api.listDealBrands()`** and **`<datalist>`** on **Brand name** in **`DealForm`** (suggestions load on mount; failures are silent so the form still works offline).

### Documentation

- [Decision](./docs/decisions/2026-04-11-deal-brand-suggestions.md) · [Architecture](./docs/architecture/deal-brand-suggestions.md) · [UX](./docs/ux/deal-brand-suggestions.md) · [Testing](./docs/testing/deal-brand-suggestions.md) · [Instrumentation](./docs/instrumentation/deal-brand-suggestions.md) · [Release](./docs/releases/RELEASE-0.4.4.md) · [Retro](./docs/retros/2026-04-11-deal-brand-suggestions.md)

## [0.4.3] - 2026-04-13

### `@oompa/utils` **0.2.2**

- **`buildDeliverablesPortfolioCsv` / `deliverablesPortfolioExportFilename`:** CSV rows for deliverables with parent deal id, title, brand, platform, type, status, dates, notes.

### `@oompa/api` **0.4.3**

- **`GET /api/v1/deals/export/deliverables`:** authenticated CSV of all deliverables for deals owned by the user. Joins deal title/brand; ordered by `dealId` then deliverable `createdAt`; capped at 10,000 rows. UTF-8 BOM; filename `oompa-deliverables-portfolio-YYYY-MM-DD.csv`.

### `@oompa/web` **0.4.3**

- **`ExportDeliverablesCsvButton`** on deals page; **`api.downloadDeliverablesPortfolioCsv()`**.

### Documentation

- [Decision](./docs/decisions/2026-04-13-deliverables-portfolio-csv-export.md) · [Architecture](./docs/architecture/deliverables-portfolio-csv-export.md) · [UX](./docs/ux/deliverables-portfolio-csv-export.md) · [Testing](./docs/testing/deliverables-portfolio-csv-export.md) · [Instrumentation](./docs/instrumentation/deliverables-portfolio-csv-export.md) · [Release](./docs/releases/RELEASE-0.4.3.md) · [Retro](./docs/retros/2026-04-13-deliverables-portfolio-csv-export.md)

## [0.4.2] - 2026-04-12

### `@oompa/utils` **0.2.1**

- **`buildPaymentsPortfolioCsv` / `paymentsPortfolioExportFilename`:** CSV rows for payment milestones with parent deal id, title, brand, amounts, status, due/received dates, invoice number, notes.

### `@oompa/api` **0.4.2**

- **`GET /api/v1/deals/export/payments`:** authenticated CSV of all payments for deals owned by the user. Joins deal title/brand; ordered by `dealId` then payment `createdAt`; capped at 10,000 rows. UTF-8 BOM + attachment filename `oompa-payments-portfolio-YYYY-MM-DD.csv`.

### `@oompa/web` **0.4.2**

- **`ExportPaymentsCsvButton`:** deals page action next to deal export.
- **`api.downloadPaymentsPortfolioCsv()`** and shared private **`fetchBinary`** for CSV GET error handling.

### Documentation

- [Decision](./docs/decisions/2026-04-12-payment-milestones-csv-export.md) · [Architecture](./docs/architecture/payment-milestones-csv-export.md) · [UX](./docs/ux/payment-milestones-csv-export.md) · [Testing](./docs/testing/payment-milestones-csv-export.md) · [Instrumentation](./docs/instrumentation/payment-milestones-csv-export.md) · [Release](./docs/releases/RELEASE-0.4.2.md) · [Retro](./docs/retros/2026-04-12-payment-milestones-csv-export.md)

## [0.4.1] - 2026-04-11

### `@oompa/utils` **0.2.0**

- **`buildDealsPortfolioCsv` / `escapeCsvCell` / `dealsPortfolioExportFilename`:** deterministic RFC 4180-style CSV builder for deal portfolio rows (CRLF; quoted fields when needed).

### `@oompa/api` **0.4.1**

- **`GET /api/v1/deals/export`:** authenticated download of all deals for the session user as UTF-8 CSV (BOM-prefixed for Excel). Columns: deal id, title, brand, status, contract value, currency, dates, notes. Ordered by `createdAt` descending; capped at 5000 rows per export.

### `@oompa/web` **0.4.1**

- **`ExportDealsCsvButton`:** deals list header action; same-origin fetch with session cookie, then browser download via object URL.
- **`api.downloadDealsPortfolioCsv()`:** binary GET helper (no JSON `Content-Type` on request).

### Documentation

- [Decision](./docs/decisions/2026-04-11-deals-portfolio-csv-export.md) · [Architecture](./docs/architecture/deals-portfolio-csv-export.md) · [UX](./docs/ux/deals-portfolio-csv-export.md) · [Testing](./docs/testing/deals-portfolio-csv-export.md) · [Instrumentation](./docs/instrumentation/deals-portfolio-csv-export.md) · [Release](./docs/releases/RELEASE-0.4.1.md) · [Retro](./docs/retros/2026-04-11-deals-portfolio-csv-export.md)

## [0.4.0] - 2026-04-10

### `@oompa/api` **0.4.0**

- **`POST /api/v1/deals/:id/duplicate`:** creates a copy of an existing deal as a new DRAFT. Clones title (appended with " (Copy)"), brandName, value, currency, notes. All payments cloned as PENDING (no dueDate, no invoiceNumber). All deliverables cloned as PENDING (no dueDate). startDate, endDate, and shareToken are cleared.

### `@oompa/web` **0.4.0**

- **`DuplicateDealButton`:** client component on the deal detail page. One click duplicates the deal and navigates the creator directly to the new DRAFT for editing.
- **`api.duplicateDeal(id)`:** added to the API client.

### Documentation

- [Decision](./docs/decisions/2026-04-10-deal-duplication.md) · [Architecture](./docs/architecture/deal-duplication.md) · [UX](./docs/ux/deal-duplication.md) · [Testing](./docs/testing/deal-duplication.md) · [Instrumentation](./docs/instrumentation/deal-duplication.md) · [Retro](./docs/retros/2026-04-10-deal-duplication.md)

## [0.2.4] - 2026-04-09

### `@oompa/types` **0.2.4**

- **`DealNextAction`:** type `{ targetStatus, label, description }` for contextual status advance suggestions.
- **`computeDealNextAction(status, payments, deliverables)`:** pure function — returns the next recommended action for a deal or `null` if none applies. Handles vacuous-truth cases (0 active deliverables → DELIVERED allowed) and excludes CANCELLED deliverables / REFUNDED payments.

### `@oompa/api` **0.2.4**

- **`service.test.ts` fixture fix:** added `shareToken: null` to `serializeDeal` test fixture (pre-existing gap from 0.2.3 when `shareToken` was added to `DbDeal`).

### `@oompa/web` **0.2.4**

- **`DealNextActionBanner`:** contextual banner on the deal detail page that detects when a deal is ready to advance to its next status and offers a one-click CTA. Banner disappears for terminal states (PAID, CANCELLED). Entrance animation (mount-gated fade-up) + button spring hover/tap; respects `prefers-reduced-motion`.
- **`PriorityActionList`:** promoted to `'use client'` — staggered entrance motion on action items (6ms delay per item); respects `prefers-reduced-motion`.

### Documentation

- [Decision](./docs/decisions/2026-04-09-deal-next-action-prompt.md) · [Architecture](./docs/architecture/deal-next-action-prompt.md) · [UX](./docs/ux/deal-next-action-prompt.md) · [Testing](./docs/testing/deal-next-action-prompt.md) · [Instrumentation](./docs/instrumentation/deal-next-action-prompt.md) · [Release](./docs/releases/RELEASE-0.2.4.md) · [Retro](./docs/retros/2026-04-09-deal-next-action-prompt.md)

## [0.2.3] - 2026-04-09

### `@oompa/types` **0.2.3**

- **`DealProposalView`:** read-only schema for the public proposal page (title, brandName, value, currency, status, dates, deliverables, payments).
- **`DealSchema`:** added optional `shareToken` field.

### `@oompa/api` **0.2.3**

- **`POST /api/v1/deals/:id/share`:** generates a 64-char cryptographically random share token and returns `{ shareToken, shareUrl }`.
- **`DELETE /api/v1/deals/:id/share`:** revokes the token (sets to null).
- **`GET /api/v1/share/:token`** (PUBLIC, no auth): returns `DealProposalView` — title, value, deliverables, payments.
- **`generateShareToken`:** `crypto.randomBytes(32).toString('hex')` utility.
- **`serializeDeal`:** now includes `shareToken` in API responses.

### `@oompa/web` **0.2.3**

- **`ShareProposalButton`:** client component on deal detail page — generates/copies/revokes the public share link.
- **`/p/[token]`:** public proposal page — no auth, no workspace shell, shows deal title, value, deliverables, and payments with "Shared via Oompa · View only" footer.

### Documentation

- [Decision](./docs/decisions/2026-04-09-shareable-proposal-link.md) · [Architecture](./docs/architecture/shareable-proposal-link.md) · [UX](./docs/ux/shareable-proposal-link.md) · [Testing](./docs/testing/shareable-proposal-link.md) · [Instrumentation](./docs/instrumentation/shareable-proposal-link.md)

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
