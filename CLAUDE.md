# CLAUDE.md — AI Development Rules

> Authority: SOURCE_OF_TRUTH.md (v1.2.0). In conflict: SOT wins.
> Version: 2.0 — compressed for token efficiency, inline architectural knowledge.

---

## 0. MANDATORY FIRST STEP

**Use code-review-graph MCP before ANY file read/search.**

| Goal | Tool |
|------|------|
| Find symbols / explore code | `semantic_search_nodes` or `query_graph` |
| Understand change impact | `get_impact_radius` |
| Review changes | `detect_changes` + `get_review_context` |
| Find callers / tests | `query_graph` pattern=`callers_of` / `tests_for` |
| Architecture overview | `get_architecture_overview` + `list_communities` |
| Renames / dead code | `refactor_tool` |
| After bulk edits | `build_or_update_graph` |

Full-repo grep/glob/read = **FORBIDDEN** when graph suffices.

---

## 1. EXECUTION WORKFLOW (ALL 8 STEPS, NO SKIPS)

```
1. RESEARCH   → feasibility, UX, alternatives; primary sources cited
2. PLAN       → scope, risks, rollback sketch
3. TEST FIRST → acceptance criteria + failure modes before any code
4. IMPLEMENT  → small atomic units; each compiles + tests pass
5. TEST RUN   → all green, ≥90% coverage
6. VALIDATE   → real browser (preview_* tools); full user flow
7. DOCUMENT   → purpose, inputs, outputs, edge cases, failure modes
8. INSTRUMENT → post-deploy signal or learning milestone (outcome work only)
```

No research → no development. No test definition → no implementation.

---

## 2. SYSTEM: WHAT IS BUILT (inline knowledge — no docs read needed)

**Stack:** TypeScript strict, Next.js 16 PWA (Serwist), Fastify API, PostgreSQL, Redis-ready, **Framer Motion** (all animations — respect `prefers-reduced-motion` via `useReducedMotion()`).

### Domain Model (Deal is root entity)
```
User → Deal (1:many)
Deal → Payment (1:many)   ← invoice, reminder, overdue detection
Deal → Deliverable (1:many) ← completion tracking, overdue detection
Deal → shareToken (nullable) ← public read-only proposal URL /p/:token
```

### Deal Lifecycle
`DRAFT → NEGOTIATING → ACTIVE → DELIVERED → PAID` (or `CANCELLED` at any point).
Smart next-action banner on `/deals/:id` prompts status advance:
- DRAFT → NEGOTIATING: always
- NEGOTIATING → ACTIVE: always
- ACTIVE → DELIVERED: all non-cancelled deliverables COMPLETED (or 0 deliverables)
- DELIVERED → PAID: all non-refunded payments RECEIVED (or 0 payments)
- PAID/CANCELLED: no banner

### Overdue Rules (centralized in `@oompa/types`)
- Payment overdue: `dueDate < now && status NOT IN (RECEIVED, REFUNDED)` → `computeIsOverdue()`
- Deliverable overdue: `dueDate < now && status NOT IN (COMPLETED, CANCELLED)` → `computeIsDeliverableOverdue()`
- Next action: `computeDealNextAction(status, payments, deliverables) → DealNextAction | null`
- Payment summary: `computePaymentSummary(dealValue, payments) → { totalContracted, totalReceived, totalOutstanding, hasOverdue }`

### API Surface
- `GET/POST/PATCH/DELETE /api/v1/deals` — CRUD, filter `?status=`, `?needsAttention=true`
- `GET/POST/PATCH/DELETE /api/v1/deals/:id/payments` + `GET/PATCH/DELETE /api/v1/payments/:id`
- `GET /api/v1/deals/:id/payments/:paymentId/invoice` — deterministic HTML invoice (no auth required for link, but session checked)
- `POST/DELETE /api/v1/deals/:id/share` → generate/revoke share token
- `GET /api/v1/share/:token` (PUBLIC) — DealProposalView
- `GET /api/v1/dashboard` — aggregated summary + 10 priority actions
- `GET /api/v1/attention` — full priority actions (unbounded)
- `POST/POST/GET /api/v1/auth/login|logout|me`

### Priority Actions Ordering
Sort: oldest dueDate first → payments before deliverables → alphabetical ID tiebreak. Dashboard: cap 10. Attention: unbounded.

### Invoice
- Sequential `INV-########` persisted on `payments.invoice_number`
- Issuer env: `INVOICE_ISSUER_NAME`, `INVOICE_ISSUER_ADDRESS`, `INVOICE_PLACE_OF_SUPPLY`
- Network-only — never cache financial artifacts offline

### PWA / Offline Rules
- Serwist service worker: precache static assets only
- All `/api/*`: network-only (NEVER serve stale financial data)
- Offline on revenue paths: show deterministic "connection required" banner
- Motion: `useReducedMotion()` disables animations when user prefers

### Auth & Tenancy
- Session cookie (HTTP-only). No JWT in localStorage.
- All deal/payment/deliverable endpoints scoped to `req.authUser.id`
- Public routes: marketing landing, `/p/:token` proposal page, `/api/v1/share/:token`

### Error State Rules
- Home: API failure → "unavailable" state. Zero deals → "empty portfolio" state. Never conflate.
- Needs attention, 0 overdue → "You're all caught up" (not generic empty)
- Zero deals → "No deals yet" + "Add deal" CTA

---

## 3. ARCHITECTURE CONSTRAINTS

- **Modular Monolith + Monorepo.** Not microservices / serverless-first / polyrepo.
- Modules: `Deal`, `Payment`, `Deliverable`, `Notification`, `Intelligence`
- Data flow: `Input → Validate → Normalize → Process → Output` — no step skipped
- No cross-module leakage. No circular deps. Composition over inheritance.
- Shared types/contracts in `/packages/types` only — never duplicated.
- Breaking contract changes: migration path + in-repo consumer notes required.

```
/apps/web     → Next.js 16, React 19, Tailwind CSS, Framer Motion, Serwist PWA
/apps/api     → Fastify, Zod, Prisma
/apps/worker  → (Phase 2) BullMQ
/packages/db  → Prisma schema + migrations + seed
/packages/types → Zod schemas + pure business logic functions (NO side effects)
/packages/utils → formatCurrency, buildPaymentReminderMessage
/packages/config → shared ESLint + TS config
```

---

## 4. UX & MOTION RULES

- Every screen answers: **"What should I do next?"**
- `<100ms` perceived response — optimistic updates
- **Framer Motion** for: page transitions, card enters, state changes, success celebrations, list reorders
- `useReducedMotion()` wraps all motion — graceful static fallback always provided
- WCAG 2.2 AA on all flows; revenue paths keyboard-operable + visible focus
- Real browser validation mandatory (use `preview_*` tools — never skip)
- Feel: intentional, premium, human-crafted — NOT generated/templated/cluttered
- `aria-current="page"` on active nav links. Document title = active view.
- Mobile-first. Test on 375px viewport.

---

## 5. TESTING

- **≥90% coverage** on all changed packages
- Unit → Integration → E2E (E2E waiver Phase 1; compensating: API tests + coverage + browser MCP checklists)
- Every bug: failing test + fix + regression protection
- Deterministic outputs only — no flaky tests

---

## 6. RELEASE GATES (all must pass)

1. `pnpm typecheck` clean
2. `pnpm lint` clean
3. `pnpm test` green, ≥90% coverage affected packages
4. DB migrations forward-compatible or rollback documented
5. Real browser validation complete
6. Performance budgets within targets or justification recorded
7. No secrets in source/logs/output
8. `detect_changes` + `get_affected_flows` confirm impact covered
9. Post-deploy signal defined for outcome-bearing features
10. Semantic version bump + CHANGELOG entry

---

## 7. AGENT ROLES (no overlap)

| Agent | Responsibility |
|-------|---------------|
| Planner | Decompose goals into atomic tasks; define I/O + success criteria |
| Researcher | Feasibility + alternatives; structured artifact output |
| Developer | Small atomic units; tests green before handoff |
| Tester | Coverage verification + missing tests + regression protection |
| Reviewer | `detect_changes` + `get_review_context`; contract + anti-pattern audit |
| Optimizer | Dead code, perf improvements, safe refactors |

---

## 8. BUILD vs REJECT

Build only if ALL true:
1. Increases revenue OR reduces risk
2. Automates or meaningfully reduces manual effort
3. Simplest viable system

Kill if: no measurable revenue impact in 2 iterations, OR increases cognitive load without outcome gain, OR introduces non-deterministic behavior.

---

## 9. SECURITY & DATA

- Secrets: env vars / secret managers ONLY — never source, prompts, logs, transcripts
- Locked dependency manifests; verify high-risk upgrades explicitly
- Minimum data collection — new fields need stated purpose
- Agents must NOT broaden data access "for convenience"
- Production data must NOT go to external LLMs without contract + written policy

---

## 10. AUTONOMY

Proceed without asking. Escalate ONLY when:
1. Blocked after 2+ retry approaches (document all)
2. Ambiguity cannot be deterministically resolved from SOURCE_OF_TRUTH.md
3. Org policy requires human approval (credentials, legal, app store)

Priority when conflicts: **User Outcome > Determinism > Simplicity > Dev Velocity > Extensibility**

---

## 11. PHASE ROADMAP (current: Phase 1 completion → Phase 2)

**Phase 1 — Deal + Payment Intelligence**
- [x] Deal CRUD + status lifecycle + pipeline strip
- [x] Payment milestones + overdue detection + invoice HTML
- [x] Deliverable tracking
- [x] Dashboard + priority actions + attention queue
- [x] Clipboard payment reminder
- [x] Shareable proposal link
- [x] Deal next-action prompt (smart status advance)
- [ ] **Email-to-deal capture** (CRITICAL — removes 80% of creation friction)
- [ ] **Scheduled payment reminders** (email/push — closes the revenue loop)
- [ ] Client/brand profiles (CRM lite)
- [x] Deal duplication
- [ ] Deal templates
- [x] CSV export (accountant workflow)

**Phase 2 — Workflow Automation**
- [ ] BullMQ worker process + job queue
- [ ] Email reminder automation
- [ ] Multi-user workspace (manager access)
- [ ] Payment reconciliation (bank match → deal)
- [ ] PWA push notifications

**Phase 3 — Pricing Intelligence**
- [ ] Explainable rate floor (rules-first; history required; never black-box)
- [ ] Deal risk scoring (brand payment behavior)

**Phase 4 — Financial Infrastructure**
- [ ] Payment processor integration
- [ ] Invoice-to-payment reconciliation
- [ ] Multi-currency conversion

---

## 12. ANTI-PATTERNS (ZERO TOLERANCE)

- Build without research first
- Implement before test definition
- Large untested changes
- `any` types or implicit types
- Cross-module leakage or circular dependencies
- Secrets in source / logs / agent output
- Full-repo grep/glob when graph suffices
- Outcome-bearing features without post-deploy measurement
- Black-box AI decisions on money or contracts
- Silent failures at any layer
- Force-push to main
- Stale financial data served offline
