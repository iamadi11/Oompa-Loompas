# CLAUDE.md — AI Dev Rules v2.1
> Authority: SOURCE_OF_TRUTH.md (v1.3.0). SOT wins all conflicts.

---

## 1. WORKFLOW (8 steps, no skips)

1. **RESEARCH** → feasibility, alternatives, sources cited
2. **PLAN** → scope, risks, rollback sketch
3. **TEST FIRST** → criteria + failure modes before code
4. **IMPLEMENT** → small atomic units, each compiles + tests pass
5. **TEST RUN** → all green, ≥90% coverage; invoke `simplify` skill
6. **VALIDATE** → update `apps/e2e/tests/` for new/changed routes + run `pnpm test:e2e:ui` (watch tests in browser) or `pnpm test:e2e` (headless); invoke `e2e` skill
7. **DOCUMENT** → purpose, inputs, outputs, edge cases, failure modes
8. **INSTRUMENT** → post-deploy signal (outcome work only)

No research → no dev. No test definition → no implementation.

---

## 2. DOMAIN MODEL

**Stack:** TypeScript strict · Next.js 16 PWA (Serwist) · Fastify · PostgreSQL · Redis · Framer Motion · React 19 · Tailwind CSS

**Data model:**
```
User → Deal (1:many)
Deal → Payment (1:many)   ← invoice · reminder · overdue
Deal → Deliverable (1:many) ← completion · overdue
Deal → shareToken (nullable) ← /p/:token public proposal
```

**Deal lifecycle:** `DRAFT → NEGOTIATING → ACTIVE → DELIVERED → PAID` (or `CANCELLED`)

**Overdue (in `@oompa/types`):**
- Payment: `dueDate < now && status NOT IN (RECEIVED, REFUNDED)` → `computeIsOverdue()`
- Deliverable: `dueDate < now && status NOT IN (COMPLETED, CANCELLED)` → `computeIsDeliverableOverdue()`
- Next action: `computeDealNextAction(status, payments, deliverables) → DealNextAction | null`
- Summary: `computePaymentSummary(dealValue, payments) → { totalContracted, totalReceived, totalOutstanding, hasOverdue }`

**Smart next-action banner on `/deals/:id`:**
- DRAFT → NEGOTIATING / NEGOTIATING → ACTIVE: always
- ACTIVE → DELIVERED: all non-cancelled deliverables COMPLETED (or 0 deliverables)
- DELIVERED → PAID: all non-refunded payments RECEIVED (or 0 payments)
- PAID/CANCELLED: no banner

**API surface:**
- `GET/POST/PATCH/DELETE /api/v1/deals` · filter `?status=` `?needsAttention=true`
- `/api/v1/deals/:id/payments` · `/api/v1/payments/:id`
- `GET /api/v1/deals/:id/payments/:paymentId/invoice` (HTML, network-only, never cache)
- `POST/DELETE /api/v1/deals/:id/share` · `GET /api/v1/share/:token` (PUBLIC)
- `GET /api/v1/dashboard` (10 priority) · `GET /api/v1/attention` (unbounded)
- `POST/POST/GET /api/v1/auth/login|logout|me`

**Priority sort:** oldest dueDate first → payments before deliverables → alphabetical ID tiebreak

**Invoice:** sequential `INV-########` on `payments.invoice_number` · env: `INVOICE_ISSUER_NAME`, `INVOICE_ISSUER_ADDRESS`, `INVOICE_PLACE_OF_SUPPLY` · never cache

**PWA:** Serwist precaches static only · `/api/*` network-only · offline → "connection required" banner · `useReducedMotion()` mandatory on all motion

**Auth:** HTTP-only session cookie · all deals/payments/deliverables scoped to `req.authUser.id` · public: marketing, `/p/:token`, `/api/v1/share/:token`

**Error states:** API fail → "unavailable" · zero deals → "empty portfolio" · zero overdue → "You're all caught up" · zero deals → "No deals yet" + "Add deal" CTA

---

## 3. ARCHITECTURE

- **Modular Monolith + Monorepo** (FINAL — no microservices / serverless-first / polyrepo)
- Modules: `Deal` · `Payment` · `Deliverable` · `Notification` · `Intelligence`
- Data flow: `Input → Validate → Normalize → Process → Output` (no step skipped)
- No cross-module leakage · no circular deps · composition over inheritance
- Shared types/contracts in `/packages/types` only
- Breaking contract changes: migration path + in-repo consumer notes required

```
/apps/web     → Next.js 16, React 19, Tailwind, Framer Motion, Serwist PWA
/apps/api     → Fastify, Zod, Prisma
/apps/worker  → (Phase 2) BullMQ
/packages/db  → Prisma schema + migrations + seed
/packages/types → Zod schemas + pure business logic (NO side effects)
/packages/utils → formatCurrency, buildPaymentReminderMessage
/packages/config → shared ESLint + TS config
```

---

## 4. UX & MOTION

- Every screen: **"What should I do next?"**
- <100ms perceived response · optimistic updates
- Framer Motion: page transitions, card enters, state changes, celebrations, list reorders
- `useReducedMotion()` wraps ALL motion · static fallback always present
- WCAG 2.2 AA · revenue paths keyboard-operable + visible focus
- E2E validation mandatory: update `apps/e2e/tests/` for changed UI + run `pnpm test:e2e` — no manual browser testing
- `aria-current="page"` on active nav · document title = active view · mobile-first (375px)

---

## 5. TESTING

- ≥90% coverage on all changed packages
- Unit → Integration → E2E
- **After every feature change:** update `apps/e2e/tests/` specs for new/changed routes, forms, and interactions; verify with `pnpm test:e2e:ui` (watch in browser) — no manual testing, no exceptions
- Use `pnpm test:e2e` for headless/CI runs; `pnpm test:e2e:ui` for interactive development
- Use `pnpm -C apps/e2e run test --grep "pattern" --ui` for targeted spec runs during development
- Every bug: failing test + fix + regression protection
- Deterministic only — no flaky tests

---

## 6. RELEASE GATES (all must pass)

1. `pnpm typecheck` clean
2. `pnpm lint` clean
3. `pnpm test` green, ≥90% coverage affected packages
4. `pnpm test:e2e:ui` green (or `pnpm test:e2e` in CI) — all E2E specs updated for the feature and passing
5. DB migrations forward-compatible or rollback documented
6. No manual browser testing — Playwright UI is the validation gate
7. Performance budgets within targets or justification recorded
8. No secrets in source/logs/output
9. Post-deploy signal defined (outcome features)
10. Semantic version bump + CHANGELOG entry

---

## 7. AGENT ROLES

| Agent | Responsibility |
|-------|---------------|
| Planner | Decompose → atomic tasks, I/O + success criteria |
| Researcher | Feasibility + alternatives, structured artifact |
| Developer | Small atomic units, tests green before handoff |
| Tester | Coverage + missing tests + regression protection |
| Reviewer | Contract audit, regression check |
| Optimizer | Dead code, perf, safe refactors |

---

## 8. BUILD vs REJECT

Build only if ALL true:
1. Increases revenue OR reduces risk
2. Automates or reduces manual effort
3. Simplest viable system

Kill: no revenue impact in 2 iterations · cognitive load without outcome · non-deterministic behavior.

---

## 9. SECURITY

- Secrets: env vars / secret managers ONLY — never source, prompts, logs, transcripts
- Locked dependency manifests · verify high-risk upgrades explicitly
- Minimum data collection · no broadened data access "for convenience"
- No production data to external LLMs without contract + written policy

---

## 10. AUTONOMY

Proceed without asking. Escalate ONLY when:
1. Blocked after 2+ retry approaches (document all)
2. Ambiguity not resolvable from SOT
3. Org policy requires human approval (credentials, legal, app store)

Priority: **User Outcome > Determinism > Simplicity > Dev Velocity > Extensibility**

---

## 11. PHASE ROADMAP

**Phase 1 — Done:** Deal CRUD + lifecycle · Payment milestones + overdue + invoice · Deliverable tracking · Dashboard + priority actions + attention queue · Clipboard reminder · Shareable proposal · Deal next-action prompt · Deal duplication · CSV export · Brand directory + deal filter

**Phase 1 — Remaining:**
- [ ] Email-to-deal capture (CRITICAL — removes 80% creation friction)
- [ ] Scheduled payment reminders (closes revenue loop)
- [ ] Client/brand profiles (CRM lite)
- [ ] Deal templates

**Phase 2:** BullMQ worker · email reminder automation · multi-user workspace · payment reconciliation

**Phase 3:** Explainable rate floor · brand payment scoring · deal risk signals

**Phase 4:** Payment processor · invoice-to-payment reconciliation · multi-currency

---

## 12. ANTI-PATTERNS (ZERO TOLERANCE)

Build without research · implement before test definition · large untested changes · `any` types · cross-module leakage · circular deps · secrets in source/logs · outcome features without post-deploy measurement · black-box AI on money/contracts · silent failures · force-push to main · stale financial data offline · shipping UI changes without updating E2E specs · manual browser testing as a substitute for `pnpm test:e2e`

---

## 13. DEFAULT AI BEHAVIOR

- **Responses:** terse, no filler, no trailing summaries
- **Commits:** use `caveman-commit` skill style (compressed, signal-only)
- **Post-implementation:** invoke `simplify` skill to review code quality
- **Post-feature UI change:** invoke `e2e` skill — update specs + run `pnpm test:e2e:ui` to watch tests pass in browser; never report done without green E2E
- **Post-ship docs:** invoke `compress` skill on memory/doc files to reduce future context load
- **Communication:** caveman full mode by default

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
