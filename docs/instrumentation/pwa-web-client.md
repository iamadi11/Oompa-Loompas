# Instrumentation: PWA / web client (optional)

**Authority:** SOURCE_OF_TRUTH.md §13 (observability) and §7.8

## Purpose

Future hooks for learning how creators use installable and offline-adjacent surfaces — **without** tracking sensitive financial payloads.

## Candidate events (not implemented until product approves)

| Event | Hypothesis |
|-------|------------|
| `pwa_install_prompt_available` | Measure opportunity vs. friction |
| `pwa_install_accepted` / `pwa_install_dismissed` | Tune when to surface education |
| `offline_fallback_shown` | Frequency of connectivity issues on core routes |

## Constraints

- No PII or deal amounts in event properties
- Align with data stewardship in SOURCE_OF_TRUTH §9.5

## Related

- [docs/ux/web-shell-pwa.md](../ux/web-shell-pwa.md)
