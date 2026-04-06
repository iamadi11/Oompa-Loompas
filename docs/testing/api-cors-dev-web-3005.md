# Test plan: API CORS dev origins (port 3005)

## Coverage baseline
Existing **`CORS (non-preflight responses)`** tests in [`apps/api/src/__tests__/cors.test.ts`](../../apps/api/src/__tests__/cors.test.ts) cover **`/health`** and **`/api/v1/health`** with **localhost:3000**.

## Test cases
| Scenario | Type | Expected |
|----------|------|----------|
| GET **`/api/v1/health`** with **`Origin: http://127.0.0.1:3005`** in default test env | Integration | **200**, **`access-control-allow-origin`** echoes origin |
| GET **`/health`** with **localhost:3000** | Integration | Unchanged — still allowed |

## Edge cases
- **Production:** CORS uses **`WEB_URL`** only — covered by code path (`NODE_ENV === 'production'`); no automated test simulating production in this file (optional future harness).

## Failure modes
- **`@fastify/cors`** registered without **`fastify-plugin`** → headers missing on GET — guarded by existing suite commentary and tests.

## Coverage target
≥90% on touched plugin code maintained via API package **`vitest run --coverage`**.
