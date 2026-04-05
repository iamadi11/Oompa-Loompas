# Test plan: Main nav `aria-current`

## Cases

| Scenario | Type | Expected |
|----------|------|----------|
| `/` + `home` | Unit | current |
| `/deals`, `/deals/x` + `deals` | Unit | current |
| `/attention` + `attention` | Unit | current |
| Cross-route | Unit | not current |
| Trailing slash normalization | Unit | `/deals/` → deals current |

## Coverage

`lib/main-nav.ts` — 100% lines (Vitest).

## UI

Manual or browser MCP: snapshot should expose `states: [current]` on the active main nav link (tool-dependent).

**Verified 2026-04-06 (Cursor browser MCP, `http://localhost:3005`):** **Revenue** `current` on `/`; **Attention** on `/attention`; **Deals** on `/deals` and `/deals?needsAttention=true`. **Repeat run** after **`.next` wipe** (missing chunk **500**): same **Pass**.
