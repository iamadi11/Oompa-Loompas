# Release `@oompa/web` **0.1.8** / `@oompa/api` **0.1.3** / `@oompa/utils` **0.1.1** (2026-04-06)

## Summary

Patch release improving **local development** reliability for **payment invoice** flows (**CORS** for **`pnpm dev:clean`** on port **3005**) and small **invoice HTML / link** accessibility polish already covered in UX docs.

## User-visible changes

- **Developers:** API accepts browser **`Origin`** from **localhost/127.0.0.1:3005** in development so **View invoice** and fetches behave like port **3000**.
- **Creators (invoice):** **View invoice** focus ring and printable invoice semantics (landmarks, labels, readable status) — see UX doc.

## Technical changes

| Area | Detail |
|------|--------|
| API | `DEV_WEB_ORIGINS` includes **3005**; `developmentOrigins()` dedupes with **`WEB_URL`** |
| API tests | CORS regression for **127.0.0.1:3005** on **`GET /api/v1/health`** |
| Utils | Invoice HTML a11y helpers (see [`payment-invoice-html-v1`](../ux/payment-invoice-html-v1.md)) |

## Verification

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
rm -rf apps/web/.next   # if `next build` fails during “Collecting page data”
pnpm build
```

## References

- Decision: [docs/decisions/2026-04-06-api-cors-dev-web-3005.md](../decisions/2026-04-06-api-cors-dev-web-3005.md)  
- Architecture: [docs/architecture/api-cors-dev-web-3005.md](../architecture/api-cors-dev-web-3005.md)  
- Ship gates: [docs/testing/ship-gates-release-0.1.8-2026-04-06.md](../testing/ship-gates-release-0.1.8-2026-04-06.md)
