# Decision: Home overview — distinguish API failure from empty portfolio
Date: 2026-04-06
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
The home (`/`) server component resolves dashboard fetch into three states: **unavailable** (null/ failed fetch), **empty** (`totalDealsCount === 0`), and **ready** (full dashboard). **Unavailable** renders explicit copy plus a **Try again** control (`router.refresh()`), not the “Add your first deal” empty state.

## Why Now
Trust is the product for a financial outcome engine (SOURCE_OF_TRUTH §1.3, §1.4). Showing “add your first deal” when the API is down implies the creator has no revenue data and trains them to distrust the system. This is operational risk compounding with every deploy blip or local dev misconfiguration.

## Why Not “Only improve API uptime”
Uptime work is necessary but not sufficient; the client must never lie about *why* the screen is empty.

## Why Not “Use a generic error boundary”
Route-level boundaries catch render/throw errors, not a successful render that chose the wrong branch from `null` data. The fix is explicit state resolution at the data boundary.

## User Without This Feature
1. API errors or dev server mismatch → home shows first-deal onboarding.
2. User believes deals disappeared or worries data loss.
3. They file support, duplicate deals, or abandon the tool.

## Success Criteria
- Null dashboard response never maps to the zero-deals CTA.
- User sees recoverable messaging and can retry without a full browser reload (optional but implemented).
- Unit tests lock the state machine; web package tests + lint + typecheck stay green.

## Assumptions (to be validated)
- Creators interpret “Try again” as safe retry (no duplicate side effects — refresh is read-only for this page).
