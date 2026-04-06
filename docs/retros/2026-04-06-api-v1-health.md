# Retro: GET /api/v1/health
Shipped: 2026-04-06

## What was built
Versioned **`GET /api/v1/health`** liveness JSON (`data` + `meta`), dedicated **`health.test.ts`**, CORS parity test, and full Ship documentation (decision, architecture, UX, testing, instrumentation).

## Decisions made (and why)
- **Liveness only** — no DB ping in v1 to avoid flaky deploy gates.
- **`{ data, meta }` envelope** — matches other `/api/v1` responses for mental consistency.
- **Keep `/health`** — backward compatibility and existing CORS regression.

## What the critic user said
Creators do not care about this URL; the risk is **operators** misconfiguring probes. The endpoint must be boring, fast, and documented.

## Post-deploy baseline
Point synthetic checks to **`/api/v1/health`**; compare failure rate vs **`/health`**-only era.

## What to watch
Probe traffic volume; if abused, rate-limit at edge.

## What we’d do differently
Add **`GET /api/v1/ready`** with DB ping in a follow-up, separate from liveness.
