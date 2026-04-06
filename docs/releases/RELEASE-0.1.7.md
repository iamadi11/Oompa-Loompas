# Release `@oompa/web` **0.1.7** / `@oompa/api` **0.1.2** (2026-04-06)

## Summary

Minor release adding **payment invoice HTML** (printable milestone invoice) and a **View invoice** entry point on the deal payments list.

## User-visible changes

- **Deal detail → Payments:** **View invoice** opens the API invoice HTML in a new tab (requires correct `NEXT_PUBLIC_API_URL` in production).

## Technical changes

| Area | Detail |
|------|--------|
| API | `GET /api/v1/deals/:dealId/payments/:paymentId/invoice` → `text/html`, `Cache-Control: no-store` |
| Utils | `escapeHtml`, `buildPaymentInvoiceHtml` |
| Web | `PUBLIC_API_BASE_URL` export; `PaymentRow` accepts `dealId` |

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

- Decision: [docs/decisions/2026-04-06-payment-invoice-html-v1.md](../decisions/2026-04-06-payment-invoice-html-v1.md)  
- Architecture: [docs/architecture/payment-invoice-html-v1.md](../architecture/payment-invoice-html-v1.md)
