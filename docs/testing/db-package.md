# `@oompa/db` test strategy

## Decision (2026-04)

**Primary coverage:** HTTP integration tests in `apps/api/src/__tests__/` mock `@oompa/db` (see CI note: no `DATABASE_URL` required). Those tests assert route behavior, validation, and error mapping against the **Prisma contract** without a live database.

**Package-level tests:** Not required for merge today. Rationale:

- Instantiating `PrismaClient` in Vitest is cheap, but **meaningful** assertions need a real PostgreSQL (or Testcontainers) plus migrations and seed discipline.
- Duplicating every query path in both API tests and DB tests adds cost without extra safety until queries become non-trivial (transactions, raw SQL, performance-sensitive aggregates).

## When to add `@oompa/db` integration tests

Add a `test` script and ephemeral Postgres when **any** of the following is true:

- New Prisma middleware, extensions, or multi-step transactions that API mocks do not exercise.
- Raw queries or `$queryRaw` that bypass the usual repository shape.
- Migration roll-forward/rollback needs automated verification beyond `prisma migrate deploy` in deploy docs.

## Compensating controls (current)

- `pnpm db:migrate` / `prisma migrate` in controlled environments before release.
- API integration suite remains the contract gate for consumer-visible persistence behavior.

## Future shape (reference)

- `packages/db` `test` script: `prisma generate && vitest run`.
- CI job service container for Postgres, `DATABASE_URL` secret from env, run minimal read/write smoke against a migrated schema.
