# Retro: Payment Tracking
Shipped: 2026-04-04

## What Was Built

Payment milestone tracking for deals. Creators can attach payment milestones to a deal, each with an amount, optional due date, optional notes, and a status (PENDING → RECEIVED). The system detects overdue payments at read time (no background worker). The deal detail page shows a summary (Contracted / Received / Outstanding) plus a list of milestones with inline "Mark received" action. Payments are created, updated, and deleted via a Fastify REST API backed by Prisma + PostgreSQL.

## Decisions Made (and why)

**Compute `isOverdue` at read time, not store it:** Storing a derived boolean creates sync problems (needs background worker to flip it). Computing at serialization time is always accurate and requires zero infrastructure.

**`router.refresh()` for mutations, not optimistic updates:** Phase 1 prioritizes correctness over perceived speed. The summary numbers and overdue state need server recalculation. Optimistic updates would require client-side shadow state for `computePaymentSummary`. Added to Phase 2 backlog.

**No edit payment UI:** The simplest path was add + mark-received + delete. A full edit form doubles the surface area for no incremental Phase 1 value. Creators can delete and re-add.

**`exactOptionalPropertyTypes: true` compatibility:** Fixed `InputProps.error?: string` to `string | undefined` — this is the correct behavior under strict optional property types. All call sites remain unchanged.

**Prisma client needs `generate` before typecheck:** Added `prisma generate` to the db build step and generated the client during development setup. CI must run `prisma generate` before `tsc`.

**Web tsconfig `extends`:** TypeScript 5.9 cannot resolve package `exports` in the `extends` field when the package is a pnpm workspace symlink in this configuration. Fixed by switching to a relative path `../../packages/config/tsconfig/nextjs.json`. Same fix pattern as was applied to API in Phase 1 Feature 1.

## What the Critic User Said

"The payment section appears directly on the deal page without any navigation — that's fast. The three numbers at the top (Contracted / Received / Outstanding) are the only numbers I actually care about. Good. I wish I could edit a payment instead of deleting and re-adding, but I can work around it. The 'Mark received' button is obvious and in the right place."

Hardest thing to get right: the `isOverdue` display — ensuring the red state only fires for genuinely unpaid past-due payments, not for RECEIVED ones even if their due date has passed.

## Post-Deploy Baseline

No production deployment yet (Phase 1 local/staging). First metric reading will be taken on first deployment.

## What To Watch

- Payment creation rate: should trend up as creators onboard
- `isOverdue` classification accuracy: monitor any bug reports around incorrect overdue flags
- API error rate on payment endpoints: should be <0.1%

## What We'd Do Differently

- Run `prisma generate` as part of the initial monorepo setup script to prevent typecheck failures in CI
- The `next-env.d.ts` file should be committed or auto-generated before `tsc --noEmit` in CI — create a setup step that runs `next build --dry-run` or manually bootstraps it
