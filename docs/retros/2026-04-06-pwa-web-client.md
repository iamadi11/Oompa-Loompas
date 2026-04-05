# Retro: PWA web client

**Shipped (merge-ready):** 2026-04-06

## What was built

Installable Next.js web client with Web App Manifest, maskable icons, `@ducanh2912/next-pwa` integration, document fallback to `/offline`, and **NetworkOnly** runtime caching for `/api/v1` so financial data is not served from a stale service-worker cache. Development keeps the service worker disabled for fast HMR.

## Decisions made (and why)

- **next-pwa** over hand-rolled Workbox: matches the accepted ADR, less bespoke SW logic to maintain, still allows explicit `runtimeCaching` overrides for API routes.
- **Manifest data in `lib/manifest-config.ts`**: keeps `app/manifest.ts` thin and allows deterministic Vitest coverage on manifest shape without running the App Router.
- **Vitest on `lib/`**: meets repository coverage gates for the web package while deferring full React component testing to a later tranche.

## Critic user (honest)

- Offline is correctly blunt (“you need connectivity”) but the **Deals** nav link still reads like a normal action offline; users may tap it and hit a broken or empty data state until network returns. Acceptable for v1 if core copy stays honest; revisit if analytics show confusion.
- Install prompts are easy to dismiss forever; no in-app education yet (instrumentation doc lists future events).

## Post-deploy baseline

Not captured here: production deploy and 15-minute monitoring were not executed from this environment. After first production cut, record Lighthouse PWA score and SW registration in staging/prod notes.

## What to watch

- Any change to `workboxOptions.runtimeCaching` or `extendDefaultRuntimeCaching`: re-verify NetworkOnly for money paths.
- Generated files under `apps/web/public/` (ignored except icons): ensure CI runs `next build` so deploy artifacts include `sw.js`.

## What we would do differently

- Add Playwright or similar for “production build + offline” automation once a stable preview URL exists, to reduce manual DevTools checks.
