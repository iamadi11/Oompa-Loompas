# Testing: E2E waiver compensating controls

## Waiver reference

- Decision: [2026-04-08-e2e-waiver-core-revenue-paths.md](../decisions/2026-04-08-e2e-waiver-core-revenue-paths.md)

## Required checks per release touching auth/deals/payments

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm boundary:check`
4. `pnpm format:check:workspace`
5. `pnpm test`
6. `pnpm build`

## Manual browser checklist (until E2E automation is merged)

- Login flow works and redirects to workspace.
- Deal list loads; create/edit/delete happy paths work.
- Payment list loads; update/delete and invoice/reminder actions function.
- Error states show deterministic fallback copy (no silent failure).

Record the run in `docs/testing/ship-gates-*.md` for each release.
