# Retro: Deals portfolio CSV export
Shipped: 2026-04-11

## What was built
Deal-level portfolio CSV export: Fastify `GET /api/v1/deals/export`, pure CSV builder in `@oompa/utils`, and `ExportDealsCsvButton` on the deals page with authenticated blob download.

## Decisions made (and why)
- **Deal rows only for v1** — fastest path to accountant value; payment-line export is a clear follow-up.  
- **5000 row cap** — bounds memory and response time without blocking Phase 1 users.  
- **BOM + CRLF** — pragmatic Excel compatibility for the target market.  

## What the critic user said
Export must not feel “technical”; one button, obvious filename, and a clear error if the API is down.

## Post-deploy baseline
Capture first-week 2xx count on `GET /api/v1/deals/export` from logs (see instrumentation doc).

## What to watch
Latency on large portfolios approaching the cap; requests for payment-level columns.

## What we’d do differently next time
Consider `Content-Disposition` filename with user timezone if multi-region usage grows.
