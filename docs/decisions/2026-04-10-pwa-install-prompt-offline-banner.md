# Decision: PWA Install Prompt + Offline Banner
Date: 2026-04-10
Phase: Phase 1.5 — PWA Engagement Layer
Status: APPROVED

## What
A `beforeinstallprompt`-powered "Add to Home Screen" card shown in the workspace after 30 seconds of
active use, suppressed for 30 days after dismissal, plus a persistent offline banner in the workspace
layout that appears when `navigator.onLine` is false.

## Why Now
- Phase 1 core is complete (v0.3.1). Feature-candidates doc explicitly names this as the next release.
- Install prompt drives the single most impactful conversion metric: activation → home screen install →
  daily return → more payment follow-ups → fewer missed payments → revenue.
- Karan (primary user, ₹60K/month) opens via browser each time. Home screen shortcut = lower friction
  = higher re-engagement frequency.
- Indian connectivity is patchy; the offline banner signals intentional product design vs a broken app.
- Zero schema changes, zero API changes, pure frontend enhancement → lowest regression risk.

## Why Not Push Notifications First
SOT §25 and feature-candidates both require an install + consent UI foundation before push.
Complexity is medium (VAPID keys, server-side push endpoint, service worker push handler, opt-in flow).
Ship order per feature-candidates: Install prompt → Offline banner → Push notifications.

## Why Not Scheduled Reminders
Phase 2 — requires BullMQ worker infrastructure not yet provisioned.

## User Without This Feature
Karan opens chrome.google.com → types "oompa" → taps URL → app loads → checks deal.
Every re-visit has 3–4 friction steps. No install shortcut. When offline, sees a browser "no connection"
error page with no context.

## Success Criteria
- Install prompt renders on Chromium browsers when `beforeinstallprompt` fires
- Prompt is suppressed for 30 days after dismissal (localStorage)
- Offline banner appears within 1 event loop tick of going offline
- Offline banner disappears immediately on reconnect
- No visual regression on existing workspace layout (tests pass, browser screenshot clean)
- iOS/Firefox: prompt is silently absent (no-op — no error)

## Assumptions (to be validated)
- `beforeinstallprompt` fires reliably on Android Chrome in production (HTTPS required)
- 30-second delay is enough engagement signal without being too late
- localStorage is available in the user's browser (try/catch handles failures gracefully)
