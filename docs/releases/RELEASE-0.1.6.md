# Release `@oompa/web` **0.1.6** (2026-04-06)

## Summary

Patch release focused on **trust and accessibility** when the dashboard API cannot be loaded, and on **release hygiene** (documented next feature candidates).

## User-visible changes

- **Home (`/`) — API unavailable:** error content is exposed as a named **`region`** with **`aria-labelledby` / `aria-describedby`**, **`aria-live="polite"`**, and **`aria-busy`** while **Try again** is in flight.
- **No change** to happy-path overview, empty portfolio, or deal flows.

## Technical changes

| Area | Detail |
|------|--------|
| Web | [apps/web/components/dashboard/OverviewFetchError.tsx](../../apps/web/components/dashboard/OverviewFetchError.tsx) |
| Tests | Existing **`resolveHomeOverviewState`** unit tests unchanged; run full **`@oompa/web`** suite |
| Docs | [docs/testing/browser-ux-checklist-home-overview-unavailable-2026-04-06.md](../testing/browser-ux-checklist-home-overview-unavailable-2026-04-06.md) |

## Verification (release gate)

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm --filter @oompa/web build
```

Optional manual check: run two Next profiles (dead API vs live API) as described in the **browser UX checklist** linked above.

## Deploy

- **CI:** push to **`main`** — see `.github/workflows/ci.yml`.
- **Staging / production:** [infra/README.md](../../infra/README.md) (`deploy-staging.yml`, `deploy-production.yml`).

## References

- Decision: [docs/decisions/2026-04-06-release-0.1.6.md](../decisions/2026-04-06-release-0.1.6.md)
- Retro: [docs/retros/2026-04-06-release-0.1.6.md](../retros/2026-04-06-release-0.1.6.md)
- Next features (research): [docs/product/feature-candidates-2026-04.md](../product/feature-candidates-2026-04.md)
