# Retro: Deal Templates

**Date:** 2026-04-16  
**Phase:** 1 (final item)  
**Status:** Shipped

## What was built

Reusable campaign templates with deliverables + percentage-based payment splits. Full CRUD API (5 endpoints), save-as-template from any existing deal, four web pages, four React components. DB migration adding 3 tables with cascade deletes. Max 20 templates per user. 537 tests green.

## Decisions + why

- **Percentage-based payments** (not absolute amounts): templates are currency-neutral. Amount is computed at deal-creation time from deal value × pct. Eliminates stale-value problem.
- **`derivePaymentLabel` from deal notes**: deal payments don't have labels; we synthesize "Payment 1 / 2 / 3" or extract from notes. Keeps save-as-template useful without requiring data re-entry.
- **`Promise.allSettled` for deliverable/payment creation**: best-effort — deal is already created, partial failure is recoverable. Fail-fast would leave a dangling deal with no items.
- **DELETE-without-body `Content-Type` fix**: surfaced via delete template 400 error. Fastify rejects `Content-Type: application/json` with empty body. Fixed centrally in `ApiClient.request()` — only sets header when body is present.
- **`DeliverablePlatformSchema.options` not hardcoded arrays**: avoids enum drift between schema and UI.

## Critic feedback incorporated

- Zero state shows CTA (not blank page) ✓
- "Use" button on template card is primary action — most prominent ✓
- Preview panel in DealFromTemplateForm shows exactly what will be created before submit ✓
- Payment amounts computed live as user types deal value ✓

## Post-deploy baseline

- Template creation flow: end-to-end validated in browser
- All 537 tests green; typecheck + lint clean
- DELETE bug fixed and covered by test assertions

## What to watch

- `DEAL_TEMPLATE_MAX_PER_USER = 20`: monitor if users hit this limit frequently
- `Promise.allSettled` on deliverable/payment creation — if partial failures occur, user sees a deal with missing items; no retry UI yet

## What to do differently

- The `Content-Type` bug on bodyless requests existed before this feature but was only caught because DELETE template was the first bodyless DELETE exercised through the UI (vs the test mock). Should have caught it in API test client assertions earlier — fixed the assertion style to not use `defaultFetchInit` with Content-Type for GET/DELETE.
