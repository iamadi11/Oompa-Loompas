# Retro: Payment invoice HTML (v1)

Shipped: 2026-04-06

## What Was Built

Deal-scoped **HTML invoice** for each payment milestone: API route under `/api/v1`, shared deterministic HTML builder in `@oompa/utils`, and a **View invoice** link on the deal payments list using `PUBLIC_API_BASE_URL`.

## Decisions Made (and why)

- **HTML before PDF** — faster to ship, trivial to regression-test, browser print covers most creators.  
- **Strict deal scoping** — `paymentId` alone is not enough; prevents guessing IDs across deals.  
- **no-store** — avoids cached invoices after edits.

## Critic User (pre-ship)

Biggest risk is **env mismatch** (`NEXT_PUBLIC_API_URL` ≠ real API); the UX fails opaque unless docs and deploy checklists stay aligned.

## Post-deploy Baseline

Not yet collected in production; see [docs/instrumentation/payment-invoice-html-v1.md](../instrumentation/payment-invoice-html-v1.md).

## What To Watch

- Invoice GET `5xx` and latency vs `listPayments`.  
- Support themes: “link 404s” → configuration issue.

## What We’d Do Differently

- Consider a **relative** `/api` proxy through Next in production so the web app does not depend on a second public origin for same-site users.

## Verification run

- `pnpm --filter @oompa/utils test`  
- `pnpm --filter @oompa/api test`  
- `pnpm --filter @oompa/web test`  
- `pnpm typecheck` + `pnpm lint`  
- `rm -rf apps/web/.next && pnpm build` in `apps/web` (avoids stale `.next` PageNotFoundError during collect)
