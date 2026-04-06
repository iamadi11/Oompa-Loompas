# Instrumentation: Auth & tenancy (release 0.2.0)

## Hypothesis

If auth and tenancy ship correctly, **unauthenticated access to `/api/v1` domain routes** should fall to ~zero in production, and **login success rate** should stabilize after initial operator misconfig spikes (wrong `WEB_URL` / missing `SESSION_SECRET`).

## Baseline

- **Pre-0.2.0:** Domain API effectively open (no session gate).  
- **Post-0.2.0 (target):** 401 on missing/invalid session for protected routes; 200 on `/api/v1/auth/*` and public health as documented.

## Post-deploy signals

| Signal | Where to read | Suggested threshold |
|--------|----------------|---------------------|
| HTTP **401** on `/api/v1/deals` (aggregate) | API access logs / APM | Spike then flat; investigate if sustained with legitimate clients |
| HTTP **403** on `/api/v1/admin/ping` | API access logs | Non-admin attempts expected occasionally |
| **Login 401** (`/api/v1/auth/login`) | API logs | Spike on deploy may indicate wrong credentials or brute force |
| **5xx** on auth routes | API logs / alerts | &lt; SLO for error rate |

## Rollout plan

- **Immediate** for non-prod environments after migration.  
- **Production:** migrate DB → deploy API → deploy web; validate health + single login path before full traffic.

## Product learning (later)

- Time-to-first-deal after signup (when self-serve registration exists).  
- Session duration vs forced re-login complaints (tune `SESSION_TTL_DAYS` if needed).
