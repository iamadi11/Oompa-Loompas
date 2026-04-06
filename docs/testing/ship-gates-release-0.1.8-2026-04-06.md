# Ship gates — run log: release **0.1.8** (2026-04-06)

Autonomous `/ship` verification for **`@oompa/web@0.1.8`**, **`@oompa/api@0.1.3`**, **`@oompa/utils@0.1.1`**.

## Phase 0 — What ships

**Product:** Phase 1 “get paid” path — **reliable local verification** of invoice-related browser flows when using **`pnpm dev:clean`** (**port 3005**), plus **invoice HTML / link** accessibility polish.

**Evidence:** [docs/decisions/2026-04-06-api-cors-dev-web-3005.md](../decisions/2026-04-06-api-cors-dev-web-3005.md), [docs/releases/RELEASE-0.1.8.md](../releases/RELEASE-0.1.8.md).

**BA challenge:** This is not hypothetical — mismatched dev ports produce real CORS failures that look like broken product.

## Gates

| # | Gate | Result | Notes |
|---|------|--------|-------|
| 1 | **`pnpm test`** (repo) | **Pass** | |
| 2 | **`pnpm typecheck`** | **Pass** | |
| 3 | **`pnpm lint`** | **Pass** | |
| 4 | **`pnpm build`** (repo) | **Pass** after **`rm -rf apps/web/.next`** | Same clean-cache guard as CI. |
| 5 | Code graph wiki | **Pass** | `generate_wiki_tool` → pages under **`.code-review-graph/wiki/`** (gitignored). |
| 6 | Browser MCP | **Pass** (2026-04-06 agent) | **`http://127.0.0.1:3005`** + API **:3001**; required **`.next` clean** first (see [browser-ux-checklist-run-2026-04-06.md](./browser-ux-checklist-run-2026-04-06.md)). Checklists updated: payment invoice, run log, dashboard, attention, deals filter, home overview addendum. |
| 7 | Migrations | **N/A** | No schema change. |
| 8 | Version + changelog | **Pass** | [CHANGELOG.md](../../CHANGELOG.md) **[0.1.8]**; package bumps in **`apps/api`**, **`apps/web`**, **`packages/utils`**. |

## Deploy

Merge to **`main`** → **`ci.yml`**; tag / GitHub Release per [infra/README.md](../../infra/README.md) if your pipeline requires it.
