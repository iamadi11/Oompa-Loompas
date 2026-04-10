# Retro: PWA Install Prompt + Offline Banner
Shipped: 2026-04-10

## What Was Built
A `beforeinstallprompt` install card (30s delay, 30-day dismiss suppression) and a `useSyncExternalStore`-based offline banner, both mounted in the workspace layout. Zero schema/API changes.

## Decisions Made (and why)
- **`useSyncExternalStore` for online state**: The first draft used `useEffect` + `setState` which triggered the `react-hooks/set-state-in-effect` lint rule. `useSyncExternalStore` is the React-canonical pattern for external subscriptions — avoids the lint issue, eliminates cascading renders, and produces correct SSR server snapshots (always online).
- **`beforeinstallprompt` guard + dev-mode disable**: The browser only fires the event on Chromium + HTTPS + installable manifest. Dev has no SW, so the prompt would never fire anyway. Explicit `NODE_ENV !== 'production'` guard ensures no confusion during local testing.
- **Pure logic in `lib/pwa/install-prompt.ts`**: Dismiss-TTL check is a pure function with no browser dependencies → 100% testable in Node, no mocking required.
- **30s delay**: Long enough to signal intent (not a casual bounce), short enough that engaged users see it in their first session.

## What the Critic User Said
"Why does the install card only appear in production? I can't test it." — Correct. This is intentional: the service worker isn't active in dev. The component is correct. Testing in staging/production or via a production build is the right path.

## Post-Deploy Baseline
First reading: check what % of return Chromium mobile visits have `display-mode: standalone` after 7 days.

## What To Watch
- `beforeinstallprompt` event firing rate in production (add analytics event if > 100 DAU)
- Offline banner showing on flaky Indian mobile connections — validate it dismisses cleanly

## What We'd Do Differently
Nothing significant. The pattern (pure logic lib → tested → component → layout wire-in) worked cleanly in one pass except for the lint issue on `useEffect`, which `useSyncExternalStore` fully resolves.
