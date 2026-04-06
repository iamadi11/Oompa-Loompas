# Test plan: GET /api/v1/health

## Coverage baseline
`query_graph` **`tests_for`** on `server.ts` returned **0** graph edges; health was previously covered only inside **`deals.test.ts`** for **`GET /health`**.

## Test cases
| Scenario | Type | Expected | Risk |
|----------|------|----------|------|
| `GET /health` | Integration | 200, `status`, parseable `timestamp` | Low |
| `GET /api/v1/health` | Integration | 200, `data.status`, `data.service`, `meta.timestamp` | High |
| CORS GET `/api/v1/health` with `Origin` | Integration | `Access-Control-Allow-Origin` echoed | Medium |

## Edge cases
- Timestamp is valid ISO string (parseable).

## Failure modes
- Route not registered → **404** (caught by test).

## Coverage target
≥90% on `apps/api/src/routes/health/index.ts` and touched `server.ts` lines.
