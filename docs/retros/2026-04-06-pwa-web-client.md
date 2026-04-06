# Retro: PWA web client

**Shipped (merge-ready):** 2026-04-06

**Update (2026-04-07):** PWA tooling moved from `@ducanh2912/next-pwa` to **`@serwist/turbopack`** so **`next dev` / `next build`** use **default Next.js 16 (Turbopack)**. Service worker is served at **`/serwist/sw.js`**; registration remains off in development.

## What was built

Installable Next.js web client with Web App Manifest, maskable icons, **Serwist** integration (`app/sw.ts`, `/serwist/sw.js`), document fallback to `/offline`, and **NetworkOnly** runtime caching for `/api/v1` so financial data is not served from a stale service-worker cache. Development keeps service worker registration disabled for fast refresh.

## Decisions made (and why)

- **Serwist (`@serwist/turbopack`)** over hand-rolled Workbox and over webpack-only `next-pwa`: Workbox-aligned behavior, explicit runtime matchers for API routes, and compatibility with **default** Next.js 16 without forcing `--webpack`.
- **Manifest data in `lib/manifest-config.ts`**: keeps `app/manifest.ts` thin and allows deterministic Vitest coverage on manifest shape without running the App Router.
- **Vitest on `lib/`**: meets repository coverage gates for the web package while deferring full React component testing to a later tranche.

## Critic user (honest)

- Offline is correctly blunt (“you need connectivity”) but the **Deals** nav link still reads like a normal action offline; users may tap it and hit a broken or empty data state until network returns. Acceptable for v1 if core copy stays honest; revisit if analytics show confusion.
- Install prompts are easy to dismiss forever; no in-app education yet (instrumentation doc lists future events).

## Post-deploy baseline

Not captured here: production deploy and 15-minute monitoring were not executed from this environment. After first production cut, record Lighthouse PWA score and SW registration in staging/prod notes.

## What to watch

- Any change to **`app/sw.ts`** `runtimeCaching` / fallbacks: re-verify **NetworkOnly** for money paths.
- Ensure CI runs **`next build`** so production artifacts include **`/serwist/sw.js`**. Legacy **`public/sw.js`** from old `next-pwa` builds remains gitignored.

## What we would do differently

- Add Playwright or similar for “production build + offline” automation once a stable preview URL exists, to reduce manual DevTools checks.
