# Ship gates — run log: release **0.1.9** (2026-04-06)

Autonomous `/ship` verification for **`@oompa/api@0.1.4`**, **`@oompa/db@0.1.1`**, **`@oompa/utils@0.1.2`** (payment invoice sequencing + issuer env + HTML v2).

## Phase 0 — What ships

**Product:** Phase 1 — **stable `INV-*` invoice numbers**, optional **issuer block** from environment, richer **printable HTML** (toolbar).

**Evidence:** [docs/decisions/2026-04-06-payment-invoice-html-v1.md](../decisions/2026-04-06-payment-invoice-html-v1.md) (amendment), [docs/releases/RELEASE-0.1.9.md](../releases/RELEASE-0.1.9.md).

## Gates

| # | Gate | Result | Notes |
|---|------|--------|-------|
| 1 | **`pnpm test`** (repo) | **Pass** | |
| 2 | **`pnpm typecheck`** | **Pass** | |
| 3 | **`pnpm lint`** | **Pass** | |
| 4 | **`pnpm build`** (repo) | **Pass** | After **`rm -rf apps/web/.next`** (CI parity). |
| 5 | Code graph wiki | **Pass** | `build_or_update_graph_tool` (incremental) + `generate_wiki_tool` → **`.code-review-graph/wiki/`** (gitignored). |
| 6 | Browser MCP | **Pass** (2026-04-06, prior agent pass) | Invoice flow + **`INV-*`** documented in [browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md](./browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md) and [browser-ux-checklist-run-2026-04-06.md](./browser-ux-checklist-run-2026-04-06.md). Re-run after env or invoice HTML changes. |
| 7 | Migrations | **Required for prod** | Deploy **`20260406120000_invoice_counter_and_number`** before or with API **0.1.4** to avoid **`P2022`**. |
| 8 | Version + changelog | **Pass** | [CHANGELOG.md](../../CHANGELOG.md) **[0.1.9]**; `package.json` in **`apps/api`**, **`packages/db`**, **`packages/utils`**. |

## Deploy

Merge to **`main`** → **`ci.yml`**. Apply DB migration in staging/production **before** serving invoice traffic on the new API build.
