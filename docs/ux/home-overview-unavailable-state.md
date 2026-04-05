# UX: Home overview unavailable state

## User journey
1. User opens **Revenue** (home).
2. If the dashboard API cannot be reached, they see a clear **load failure** message — not onboarding.
3. They tap **Try again** to re-run the server component fetch via `router.refresh()`.

## States
- **Zero state (no deals, API ok):** Unchanged — headline + **Add your first deal**.
- **Loading:** Next.js RSC suspense/streaming as configured; no new spinner (out of scope).
- **Success:** Unchanged overview (priority actions, summary, recent deals).
- **Error (unavailable):** Title explains load failure; body reassures data is not deleted; primary action **Try again**.

## Critic feedback
- A distracted user may still blame “the app” before reading — copy must be short and reassuring (implemented).
- If the API is persistently down, repeated **Try again** is frustrating; future work could deep-link to status or offline shell messaging (not in this slice).

## Accessibility
- **Keyboard:** **Try again** is a native `button` with focus ring via shared `Button` styles.
- **WCAG 2.2 AA:** Sufficient contrast on primary button; heading hierarchy preserved (`h1` on page).
- **Focus indicators:** `focus-visible` ring on button per design system.
