# Ship gates — run log (2026-04-06)

Autonomous `/ship` verification against **`main`** at release **`@oompa/web@0.1.6`** (plus CI hardening commit when merged).

## Phase 0 — What ships

**Product:** Creator Revenue Intelligence, Phase 1 — home overview **trust** (unavailable vs empty) + **a11y** region for API failure.

**Evidence:** [docs/decisions/2026-04-06-release-0.1.6.md](../decisions/2026-04-06-release-0.1.6.md), [docs/product/feature-candidates-2026-04.md](../product/feature-candidates-2026-04.md).

**BA challenge:** Conflating API failure with “no deals” is a real trust bug; a11y region is the smallest fix that also helps SR users.

## Gates

| # | Gate | Result | Notes |
|---|------|--------|-------|
| 1 | **`pnpm test`** (repo) | **Pass** | |
| 2 | **`pnpm typecheck`** | **Pass** | |
| 3 | **`pnpm lint`** | **Pass** | |
| 4 | **`pnpm build`** (repo) | **Pass** after **`rm -rf apps/web/.next`** | Without clean, stale `.next` caused **`PageNotFoundError`** during “Collecting page data” for `/deals/[id]`, `/attention`, etc. |
| 5 | Code graph wiki | **Pass** | `generate_wiki_tool` **force=true** → 65 pages generated (gitignored). |
| 6 | Browser MCP | **Skipped** | No guaranteed local dev server in agent environment; use [browser-ux-checklist-home-overview-unavailable-2026-04-06.md](./browser-ux-checklist-home-overview-unavailable-2026-04-06.md). |
| 7 | Migrations | **N/A** | No schema change in this slice. |
| 8 | Version + changelog | **Pass** | **`@oompa/web@0.1.6`**, [CHANGELOG.md](../../CHANGELOG.md) **[0.1.6]**. |

## CI follow-up

[`.github/workflows/ci-reusable.yml`](../../.github/workflows/ci-reusable.yml) runs **`rm -rf apps/web/.next`** before **`pnpm build`** so agents and self-hosted runners do not inherit a broken cache.

## Deploy

Push **`main`** → **`ci.yml`**; publish GitHub **Release** per [infra/README.md](../../infra/README.md) for production workflow triggers.
