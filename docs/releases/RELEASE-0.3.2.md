# Release 0.3.2 — PWA Install Prompt + Offline Banner

**Date:** 2026-04-10
**Phase:** 1.5 — PWA Engagement Layer

---

## What shipped

### PWA Install Prompt
- `beforeinstallprompt`-powered card shown after 30s of active workspace use
- Suppressed for 30 days after user dismissal (localStorage)
- iOS / Firefox: silently absent (no error, no broken UI)
- Dev mode: disabled (service worker not active)
- Keyboard accessible, WCAG 2.2 AA focus indicators

### Offline Banner
- Persistent banner below top nav when `navigator.onLine` is false
- Disappears immediately on reconnect
- Uses `useSyncExternalStore` — no cascading renders, correct SSR hydration
- Explicit copy: "No connection — deal and payment data requires a live connection"
- Satisfies SOT §7.8: revenue paths show deterministic offline messaging, never stale data

---

## Files changed

```
apps/web/lib/pwa/install-prompt.ts           NEW — pure dismiss-state logic
apps/web/lib/__tests__/install-prompt.test.ts  NEW — 7 tests, 100% coverage
apps/web/components/pwa/InstallPrompt.tsx    NEW — A2HS card component
apps/web/components/pwa/OfflineBanner.tsx    NEW — useSyncExternalStore banner
apps/web/app/(workspace)/layout.tsx          UPDATED — mounts OfflineBanner + InstallPrompt
package.json                                 0.3.1 → 0.3.2
apps/web/package.json                        0.3.1 → 0.3.2
```

---

## Test coverage

- 80 tests passing (7 new for install-prompt logic)
- `lib/pwa/install-prompt.ts`: 100% statements / branches / functions
- Typecheck: clean
- Lint: clean

---

## Release gates

- [x] CI: typecheck + lint + tests all green
- [x] Migrations: none required
- [x] Browser: real-browser validation — offline banner on/off cycle confirmed
- [x] Performance: layout-only change, no new data fetching, no bundle impact beyond two small client components
- [x] Security: no new auth, no data collection, no secrets
- [x] Impact: frontend-only, no API changes
- [x] Observability: instrumentation doc written
- [x] Versioning: 0.3.1 → 0.3.2
