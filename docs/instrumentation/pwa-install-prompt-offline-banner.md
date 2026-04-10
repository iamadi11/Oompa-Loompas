# Instrumentation: PWA Install Prompt + Offline Banner

## Hypothesis
If we show a native A2HS prompt after 30s of workspace engagement, ≥5% of mobile-session users
install the PWA within 7 days of first seeing the prompt, leading to higher daily return rate
(measured by repeat /dashboard loads from standalone display-mode sessions).

## Baseline
- PWA installability: manifest + SW in place since v0.2.x
- Install rate before this release: 0 (no prompt existed)
- Offline banner: did not exist — users saw browser error page

## Post-Deploy Signals

| Signal | Where to Read | Alert Threshold |
|--------|--------------|----------------|
| `beforeinstallprompt` fires | Browser console / analytics if added | — |
| PWA installed (standalone mode) | `window.matchMedia('(display-mode: standalone)')` on page load | — |
| Offline banner shown | `navigator.onLine === false` at workspace load | — |
| Prompt dismiss rate | `localStorage['oompa_install_prompt_dismissed']` present on session | — |

## Rollout Plan
Immediate — no feature flag needed. Install prompt is gated by browser support
(`beforeinstallprompt` only fires on Chromium + HTTPS). iOS users see no prompt (silent no-op).
Offline banner is universal, low risk.

## Learning Milestone
After first 100 production sessions: check what % of Chromium mobile users have standalone
display-mode on return visits. This is the proxy metric for install success.
