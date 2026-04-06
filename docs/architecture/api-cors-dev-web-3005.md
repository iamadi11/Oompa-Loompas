# Architecture: API CORS dev origins (port 3005)

## Module
**Infra / API shell** — cross-cutting Fastify plugin; not a Deal, Payment, or Deliverable domain module.

## Data flow
**Input:** Request **`Origin`** header, **`NODE_ENV`**, **`WEB_URL`**.  
**Validate:** Production → single origin string; development → deduped list (**`WEB_URL`** + fixed local dev hosts).  
**Normalize:** `@fastify/cors` with **`credentials: true`**.  
**Process:** Hook runs on parent Fastify instance via **`fastify-plugin`** (no encapsulation bug).  
**Output:** Response CORS headers on non-preflight responses.

## API contract
No new HTTP routes. Behavior change is **response headers** only for allowed origins.

## Scale analysis
Negligible: fixed small allowlist in memory per process.

## Tech choices
| Choice | Alternatives | Why this |
|--------|----------------|----------|
| Explicit dev host list | Dynamic `origin: true` | Deterministic, reviewable allowlist |
| `fastify-plugin` wrapper | Bare async plugin | CORS applies to all routes on the root instance |

## Operational design
**Production:** Set **`WEB_URL`** to the canonical web origin (e.g. `https://app.example.com`).  
**Rollback:** Revert plugin change; no migration.
