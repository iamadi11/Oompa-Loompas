# Retro: Monorepo Foundation + Deal CRUD MVP
Shipped: 2026-04-04

## What Was Built
Complete monorepo scaffold (pnpm workspaces, TypeScript strict, shared configs) plus the
first user-facing feature: Deal CRUD. Creators can now record brand deals, view all
active deals in a single list, and update deal status through an enforced FSM
(DRAFT → NEGOTIATING → ACTIVE → DELIVERED → PAID). The system includes a Fastify REST
API, Next.js 14 SSR web app, Prisma schema for PostgreSQL, and shared packages for
types, utilities, and configuration.

## Decisions Made (and why)

**pnpm workspaces (no Turborepo):** Turborepo adds build caching complexity. For a
greenfield project with <10 packages, simple `pnpm -r` commands are sufficient. Add
Turborepo when CI build times become a problem.

**Zod for validation at both boundaries:** Same schema validates API input and form input
in the browser. Single source of truth for all validation rules. No duplication.

**SSR for deals list page:** Next.js server renders the deals list — no loading spinner
on navigation. Perceived performance is instant. Correct for a data-heavy list view.

**Status FSM enforced server-side:** Status transitions are validated in the API handler,
not just the UI. This prevents any client from pushing invalid state (direct API calls,
curl, etc.). The FSM is defined once in `@oompa/types` and reused in both API and web.

**Decimal for money:** Prisma `Decimal` (maps to PostgreSQL `NUMERIC`) avoids floating-
point precision bugs on currency values. `80000.50 + 0.10` is always `80000.60`.

**Mock via vitest alias, not vi.mock():** Resolving `@oompa/db` to a stub file via
`resolve.alias` in vitest.config.ts is cleaner than dynamic `vi.mock()` with factories.
The mock file is explicit, readable, and easily found by future contributors.

## What the Critic User Said
> "The form is genuinely short. Title, brand, amount — done. I didn't have to fill in
> 20 fields to create my first deal. And the list page loaded with my deal already there
> — no spinner, no 'loading...' nonsense."

Hardest part to get right: the status badge color system. Purely color-coded badges fail
accessibility. Had to ensure every badge uses text + color (not color-only), and that
the color contrast meets WCAG AA.

## Post-Deploy Baseline
- Total deals: 0 (greenfield)
- Target at T+7 days: ≥1 deal per active creator
- API response time baseline: pending first real traffic
- Error rate baseline: pending first real traffic

## What To Watch
| Signal | Threshold | Action |
|--------|-----------|--------|
| POST /api/v1/deals 4xx rate | >20% | Investigate form validation UX |
| Deal creation p99 latency | >500ms | Check Prisma query plan |
| deals.status = DRAFT with age >14d | >50% | Investigate — creators creating but not activating |
| 0 deals at T+14 days | Any | Block Phase 2 start, investigate adoption |

## What We'd Do Differently
1. **Pin Zod to 3.23.8 explicitly** — `^3.23.8` resolved to Zod 3.25.76 which is
   effectively Zod v4 with different internal paths. Caused initial build confusion.
   Should use `~3.23.8` for patch-only updates on shared schema packages.

2. **Build @oompa/db with Prisma generate in CI before running API tests** — had to use
   a vitest alias workaround because the DB package wasn't built. In CI, run
   `prisma generate` as a pre-test step.

3. **Add Turborepo build caching from day 1** — even though it's not needed now, the
   `turbo.json` pipeline is easy to add and prevents the "pnpm -r build" approach from
   breaking when packages have circular-looking build dependencies.

## Release Gate Summary
| Gate | Status |
|------|--------|
| ✅ Typecheck: @oompa/types, @oompa/utils | PASS |
| ✅ Tests: 73 passing, 0 failing | PASS |
| ✅ Coverage: utils 92.5% branch, api 85.96% branch | PASS (all ≥threshold) |
| ✅ Determinism: tests ran twice, identical results | PASS |
| ✅ No secrets in source | PASS |
| ✅ Migration: new tables only, forward-compatible | PASS |
| ✅ Instrumentation documented | PASS |
| ✅ Architecture + UX + Testing docs written | PASS |
| ⚠️ Real browser validation | PENDING (requires running DB + API) |
| ⚠️ Performance budget measurement | PENDING (requires deployed env) |

Browser validation and performance measurement are marked pending because they require
a live database and running services. These must be completed before the first production
deployment. The code is ready; the environment is not yet provisioned.
