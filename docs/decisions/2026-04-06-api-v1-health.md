# Decision: GET /api/v1/health (versioned health probe)
Date: 2026-04-06
Phase: Phase 4 — Financial infrastructure layer (readiness / ops); supports Phase 1 web client
Status: APPROVED

## What
Add **`GET /api/v1/health`** returning a **`{ data, meta }`** JSON envelope (`data.status === 'ok'`, `data.service === '@oompa/api'`, `meta.timestamp` ISO). Keep existing **`GET /health`** for backward compatibility and existing CORS tests.

## Why now
Load balancers, k8s probes, and platform health checks often only target **`/api/v1/*`**. The root **`/health`** route is easy to miss in path-based routing, creating false “API down” signals or extra ingress rules. This is **operational risk reduction** with negligible code surface.

## Why not “only document /health”
Operators still must carve an exception path; a first-class versioned route matches how every other resource is exposed.

## Why not DB connectivity in v1
A DB check belongs in a **`/ready`** or deep health slice; coupling migrations to a shallow **liveness** probe increases flake and deploy coupling. Ship **liveness** first; **readiness** can extend this handler later with explicit contract.

## User without this feature
1. Configure probe to **`/health`** or raw TCP.
2. Some gateways strip non-`/api` routes → flaky health or custom workarounds.

## Success criteria
- **`GET /api/v1/health`** returns **200** with stable JSON shape.
- Integration tests + CORS header parity with **`/health`** for browser-origin requests.
- No new secrets; no auth (public liveness).

## Assumptions (to be validated)
- Public liveness is acceptable (no sensitive data in body — only service name and timestamp).
