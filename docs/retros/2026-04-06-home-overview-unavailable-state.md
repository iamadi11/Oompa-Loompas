# Retro: Home overview unavailable state
Shipped: 2026-04-06

## What was built
Explicit three-state resolution for the home dashboard (`unavailable` / `empty` / `ready`), a client **Try again** control using `router.refresh()`, and unit tests for the resolver.

## Decisions made (and why)
- **State resolver in `lib/`** — keeps the App Router page thin and testable, consistent with `deals-page.ts`.
- **Client retry** — aligns with `DealForm` / payment sections; avoids telling users only to hard-refresh.

## What the critic user said
The worst failure is lying about money; this removes that failure mode for the common “API down” case. Remaining gap: persistent outage still feels like a dead end without a deeper offline or status story.

## Post-deploy baseline
Capture support/analytics when available; compare “lost my deals” reports pre/post.

## What to watch
Dashboard endpoint error rate; spike correlated with deploys.

## What we’d do differently
Add a lightweight link to **Attention** or **Deals** only when we know partial data could still be served from another route (not applicable until caching or client-side stores exist).
