# Test plan: Payment reminder copy

## Coverage

| Area | Tests |
|------|--------|
| `@oompa/utils` | `payment-reminder-message.test.ts` — greeting, due line, invoice block, empty brand/title |
| `@oompa/api` | `dashboard.test.ts` — `brandName` on overdue payment priority action |
| `@oompa/web` | Existing suites + typecheck; manual browser: copy + toast |

## Failure modes

- Clipboard API denied → error toast (manual).
- Mixed API/web versions missing `brandName` → Zod/runtime issues; deploy web + API together.
