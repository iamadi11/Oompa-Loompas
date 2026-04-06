# Decision: API CORS — allow Next.js `dev:clean` origins (port 3005)
Date: 2026-04-06
Phase: Phase 1 — Deal + Payment Intelligence (developer trust path for invoice HTML in local dev)
Status: APPROVED

## What
In **non-production**, extend the API CORS allowlist with **`http://localhost:3005`** and **`http://127.0.0.1:3005`** alongside existing **3000** origins. **`WEB_URL`** remains the primary configured origin; the extra hosts cover `pnpm dev:clean` in `apps/web` without forcing every developer to rewrite env when switching ports.

## Why now
**View invoice** opens the API HTML in a new browser context. When the web app runs on **3005**, a missing CORS mirror causes the browser to block or omit **`Access-Control-Allow-Origin`** on API responses, making local verification of the payment invoice flow unreliable. That is **operational and trust risk** during the core “get paid” epic.

## Why not “only document WEB_URL=http://localhost:3005”
Developers still bounce between **3000** and **3005** (clean rebuild workflow). A fixed allowlist for both ports removes silent failures and matches how Next dev hostnames vary (**localhost** vs **127.0.0.1**).

## Why not `origin: true` in development
Reflecting any Origin is convenient but broadens dev attack surface (e.g. malicious local pages calling the API with cookies if ever enabled). An explicit small set stays deterministic and reviewable.

## User without this feature
1. Run **`dev:clean`** on **3005** with API **`WEB_URL`** still pointing at **3000**.  
2. Open **View invoice** → browser shows CORS/network failure or missing CORS headers despite API being up.  
3. Waste time debugging env or assume invoice is broken.

## Success criteria
- **`GET /api/v1/health`** (and other routes) return **`Access-Control-Allow-Origin`** matching **`Origin`** when **`Origin`** is **127.0.0.1:3005** or **localhost:3005** in development.  
- **Production** behavior unchanged: single **`WEB_URL`** origin only.  
- Regression test in **`apps/api/src/__tests__/cors.test.ts`**.

## Assumptions (to be validated)
- Local API continues to run with **`NODE_ENV !== 'production'`** for development; production never needs the 3005 entries.

## Amendment (2026-04-06) — loopback `http` on any port

**Problem:** Developers run **`next dev -p <port>`** on many ports (**3006**, **3007**, etc.). Listing each port caused **CORS preflight failures** for in-browser **`fetch`** (e.g. create deal).

**Change:** In **non-production**, after the fixed list check, allow **`http://localhost:<any>`** and **`http://127.0.0.1:<any>`** and echo that **`Origin`** back. **Reject** non-loopback hosts (e.g. **`http://192.168.x.x`**). **Production** unchanged.

**Why not `origin: true` for all dev:** Still narrowed to **loopback `http`** only, not arbitrary **`file:`** or LAN origins.
