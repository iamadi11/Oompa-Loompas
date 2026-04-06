# Release `@oompa/api` **0.1.4** / `@oompa/db` **0.1.1** / `@oompa/utils` **0.1.2** (2026-04-06)

## Summary

Extends **payment milestone invoices** with **deterministic sequential numbers** (`INV-########`), a **global counter** table, optional **issuer / document label / place of supply** from server environment, and a richer **printable HTML** surface (toolbar actions) shared from **`@oompa/utils`**.

## User-visible changes

- **Creators:** Opening **View invoice** the first time assigns a **stable invoice number** shown on the document and reused on later opens.  
- **Operators:** Configure **`INVOICE_*`** variables so the PDF/printout includes legal name, address, tax lines, and jurisdiction hints where needed.

## Technical changes

| Area | Detail |
|------|--------|
| API | Transaction: payment row lock → counter upsert → persist **`invoice_number`**; env helpers in `apps/api/src/lib/payment-invoice-env.ts` |
| DB | Migration `20260406120000_invoice_counter_and_number` |
| Utils | Expanded `buildPaymentInvoiceHtml` + client toolbar script embedded in HTML |

## Deploy ordering

1. Run **`pnpm --filter @oompa/db db:migrate:deploy`** (or equivalent) so **`payments.invoice_number`** exists before traffic hits the new API.  
2. Deploy API **0.1.4** (or newer).

## Verification

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

## References

- Decision (amendment): [docs/decisions/2026-04-06-payment-invoice-html-v1.md](../decisions/2026-04-06-payment-invoice-html-v1.md)  
- Architecture: [docs/architecture/payment-invoice-html-v1.md](../architecture/payment-invoice-html-v1.md)  
- UX: [docs/ux/payment-invoice-html-v1.md](../ux/payment-invoice-html-v1.md)  
- Browser checklist: [docs/testing/browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md](../testing/browser-ux-checklist-payment-invoice-html-v1-2026-04-06.md)
