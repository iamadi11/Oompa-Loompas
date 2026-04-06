# Test Plan: Payment invoice HTML (v1)

## Coverage baseline

Graph `tests_for` on payment handlers previously covered CRUD only; invoice path had no tests.

## Test cases

| Scenario | Type | Expected | Risk |
|----------|------|----------|------|
| `escapeHtml` special chars | Unit | `& < > " '` escaped | High |
| `buildPaymentInvoiceHtml` XSS in brand/title | Unit | No raw `<script>` | High |
| `buildPaymentInvoiceHtml` unknown currency | Unit | Falls back to INR display | Medium |
| GET invoice happy path | Integration | `200`, `text/html`, `no-store`, contains brand + id | High |
| GET invoice payment missing | Integration | `404` | Medium |
| GET invoice wrong `dealId` | Integration | `404` (no leak) | High |
| `PUBLIC_API_BASE_URL` default | Unit | Matches JSON client default origin | Medium |

## Edge cases

- Payment with null `dueDate` / `receivedAt` — rows omitted in table.  
- Long notes — escaped, preserved as plain text.  
- Deal/payment currency mismatch — amount formatted with **payment** currency (with unknown → INR fallback).

## Failure mode tests

- Prisma errors surface as existing global `500` handler (unchanged).

## Coverage target

≥90% on touched packages per workspace thresholds (`@oompa/utils`, `@oompa/api`, `@oompa/web`).
