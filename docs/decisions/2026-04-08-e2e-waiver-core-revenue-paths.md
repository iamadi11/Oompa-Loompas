# Decision: Temporary E2E waiver for core revenue paths

Date: 2026-04-08  
Phase: 1 (Deal + Payment intelligence)  
Status: APPROVED (time-boxed waiver)

## What

Approve a temporary waiver for browser E2E automation in this repo and require compensating controls until Playwright coverage is landed.

## Why now

- Current workspace has no Playwright/Cypress runner committed.
- Quality policy requires unit + integration + E2E for core money paths.
- Blocking all releases until a full E2E harness is installed would stall urgent revenue-risk fixes.

## Compensating controls (required while waiver is active)

1. API integration tests in `apps/api/src/__tests__/` remain green in CI.
2. Web `lib/**` coverage threshold remains at ≥90% and is enforced in CI.
3. Browser validation checklist is recorded for each release touching auth, deals, or payments.
4. `pnpm boundary:check` and scoped Prettier gate stay in CI.

## Scope

Waiver only applies to missing automated browser E2E in this repository.
It does not waive API integration tests, typecheck, lint, build, or release-gate docs.

## Expiry / exit criteria

Waiver expires when any one of the following is true:

- Playwright (or equivalent) is merged with CI for at least three smoke flows:
  - authenticated session/login path
  - deal create/edit flow
  - payment state-change flow (mark received or reminder copy path)
- or the team records a superseding architecture decision with stronger controls.

Owner: engineering.
