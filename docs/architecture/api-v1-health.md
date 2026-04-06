# Architecture: GET /api/v1/health

## Module
**Infra / API shell** — not Deal, Payment, or Intelligence domain logic. No database access.

## Data flow
Input: HTTP GET  
→ Validate: _(none — no body)_  
→ Normalize: N/A  
→ Process: build constant JSON payload + ISO timestamp  
→ Output: `200` + JSON

## Data model changes
None.

## API contract
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/v1/health` | `{ data: { status: 'ok', service: '@oompa/api' }, meta: { timestamp: string } }` |

**Backward compatibility:** `GET /health` remains `{ status: 'ok', timestamp: string }`.

## Events
Emits: none.  
Consumes: none.

## Scale analysis
O(1) CPU; no I/O. Safe under high probe frequency; rate-limit at edge if abused.

## Tech choices
| Choice | Alternatives | Why this |
|--------|----------------|----------|
| Fastify route plugin `healthV1Routes` | Inline in `server.ts` | Keeps `server.ts` thin; matches other route modules |
| `data` + `meta` envelope | Flat JSON | Aligns mentally with other `/api/v1` responses |

## Operational design
- **Deploy:** standard API deploy; no migration.
- **Rollback:** remove route registration; clients fall back to **`/health`**.
- **Monitoring:** alert on non-200 or missing JSON fields in synthetic checks.
- **Caching:** `GET /api/v1/health` and legacy `GET /health` send `Cache-Control: public, max-age=5` so edge probes can cache briefly without affecting authenticated JSON routes (which remain `no-store` on the web rewrite path where applicable).
