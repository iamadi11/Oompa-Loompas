# Testing: PWA / web client

**Authority:** SOURCE_OF_TRUTH.md §7.5, §7.8

## Acceptance criteria (manual, production build)

Run `pnpm --filter @oompa/web build` and `pnpm --filter @oompa/web start` (or platform equivalent), then:

1. **Manifest:** DevTools → Application → Manifest shows name, icons, `display`, `theme_color`, start URL without errors.
2. **Service worker:** In production build only, SW registers (`/serwist/sw.js`); in `next dev`, registration is disabled (`SerwistRegister`).
3. **Installability (Chromium):** Lighthouse PWA category — no critical failures for install-related checks.
4. **Offline shell:** With network disabled, opening the app shows the offline fallback or explicit failure — not a blank shell and **not** stale deal/payment lists presented as current.
5. **Accessibility:** Tab through header nav and offline page; focus visible; landmarks sensible.

## Automated checks (recommended)

- Run `pnpm --filter @oompa/web verify:pwa` — asserts `app/manifest.ts`, `app/sw.ts`, Serwist route, and maskable icons exist (committed sources; not generated SW output).
- Run `pnpm --filter @oompa/web test` — Vitest coverage for `lib/manifest-config.ts` (manifest shape) and `lib/api.ts` (API client; network truth at runtime).
- Add CI step alongside `pnpm --filter @oompa/web build` for release branches.
- Optional: Lighthouse CI on a stable URL when a staging environment exists.

## Regression focus

- Changing `next.config.mjs` (`withSerwist`) or `app/sw.ts`: re-run production build and confirm `/api/v1` is not cache-first for financial flows (see [docs/architecture/pwa-web-client.md](../architecture/pwa-web-client.md)).

## Related

- [docs/decisions/2026-04-06-pwa-web-client.md](../decisions/2026-04-06-pwa-web-client.md)
