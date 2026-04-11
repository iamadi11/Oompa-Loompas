# Graph Report - .  (2026-04-11)

## Corpus Check
- Large corpus: 438 files · ~115,158 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 987 nodes · 1162 edges · 124 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 97 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `ApiClient` - 33 edges
2. `CHANGELOG.md: Release History` - 15 edges
3. `Needs Attention Filter — Overdue Deal Filter` - 15 edges
4. `buildPaymentInvoiceHtml()` - 11 edges
5. `Feature Candidates PM Research Snapshot April 2026` - 11 edges
6. `Deal Lifecycle: DRAFT → NEGOTIATING → ACTIVE → DELIVERED → PAID (or CANCELLED)` - 10 edges
7. `Brand Directory: /deals/brands with contracted totals per currency` - 9 edges
8. `Deal CRUD — Core Entity` - 9 edges
9. `Brand Profiles Architecture` - 8 edges
10. `Deal Module` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Agents Mandatory 8-Step Execution Workflow` --semantically_similar_to--> `Mandatory 8-Step Execution Workflow`  [INFERRED] [semantically similar]
  AGENTS.md → SOURCE_OF_TRUTH.md
- `Brand Directory: /deals/brands with contracted totals per currency` --semantically_similar_to--> `Email-to-Deal Capture (Deferred Phase 2)`  [INFERRED] [semantically similar]
  CHANGELOG.md → docs/product/feature-candidates-2026-04.md
- `Istanbul/NYC Coverage Report Favicon (yellow building/chart icon)` --conceptually_related_to--> `Retro: Payment Invoice HTML v1`  [INFERRED]
  packages/types/coverage/lcov-report/favicon.png → docs/retros/2026-04-06-payment-invoice-html-v1.md
- `Agents Context Optimization: code-review-graph MCP First` --semantically_similar_to--> `Context Optimization: code-review-graph MCP, No Full-Repo Reads`  [INFERRED] [semantically similar]
  AGENTS.md → SOURCE_OF_TRUTH.md
- `Agent Roles: Planner, Researcher, Developer, Tester, Reviewer, Optimizer` --semantically_similar_to--> `Multi-Agent System: Planner, Researcher, Developer, Tester, Reviewer, Optimizer`  [INFERRED] [semantically similar]
  AGENTS.md → SOURCE_OF_TRUTH.md

## Hyperedges (group relationships)
- **Phase 1 Feature Delivery: Deal Lifecycle, CSV Exports, Brand Directory** — sot_phase1, concept_deal_lifecycle, concept_csv_exports, concept_brand_directory, release_046 [EXTRACTED 1.00]
- **Release Gate: CI + Tests + Browser + Instrumentation** — sot_release_gates, sot_testing_standards, sot_outcome_validation, sot_execution_workflow [EXTRACTED 1.00]
- **Research-First Development: Research → Plan → Test → Implement** — concept_research_first, sot_execution_workflow, sot_anti_patterns, sot_build_reject [EXTRACTED 1.00]
- **CSV Export Trilogy — Deals, Attention, Deliverables** — concept_deals_csv_export, concept_attention_csv_export, concept_deliverables_csv_export [INFERRED 0.90]
- **Phase 1 Core Data Entities — Deal, Payment, Deliverable** — concept_deal_crud, concept_payment_tracking, concept_deliverable_tracking [EXTRACTED 1.00]
- **Overdue Triage Flow — Priority Actions, Attention Filter, Reminder** — concept_priority_actions, concept_needs_attention_filter, concept_payment_reminder_clipboard [INFERRED 0.85]
- **CSV Export Feature Family (Deals, Payments, Attention Queue)** — dec_attention_csv_export, dec_payment_milestones_csv, instr_deals_portfolio_csv [INFERRED 0.90]
- **Brand CRM Lite Progression (Suggestions → Directory → Profiles)** — dec_deal_brand_suggestions, instr_brand_directory, dec_brand_profiles [INFERRED 0.85]
- **Overdue Management Flow (Dashboard Priority → Attention Queue → CSV Export)** — instr_dashboard_priority, dec_attention_queue, dec_attention_csv_export [EXTRACTED 0.90]
- **Overdue Payment Clearance Flow** — concept_overdue_payment, concept_needs_attention_filter, concept_payment_reminder, concept_deal_next_action [INFERRED 0.80]
- **CSV Export Portfolio Suite** — concept_deals_csv_export, concept_attention_queue_export, concept_deliverables_csv_export [INFERRED 0.85]
- **PWA Install and Offline Signal Cluster** — concept_pwa_install_prompt, concept_offline_banner, concept_pwa_events [EXTRACTED 0.90]
- **Browser UX Checklist Run Suite (2026-04-06)** — testing_browser_ux_checklist_run, testing_browser_ux_attention_queue_checklist, testing_browser_ux_home_overview_unavailable, testing_browser_ux_payment_invoice [EXTRACTED 1.00]
- **CSV Export Feature Set** — testing_payment_milestones_csv_export, testing_attention_queue_csv_export, concept_csv_export [EXTRACTED 1.00]
- **Release 0.2.0 Ship Gates Verification** — testing_ship_gates_release_0_2_0, testing_ux_checklist_results, testing_e2e_waiver_compensating_controls [EXTRACTED 1.00]
- **CSV Export Features (Deals, Payments, Deliverables)** — ux_deals_portfolio_csv_export, ux_payment_milestones_csv_export, testing_deliverables_csv_export [INFERRED 0.85]
- **Brand Feature Cluster (Directory, Profiles, Suggestions)** — ux_brand_directory, testing_brand_profiles, testing_deal_brand_suggestions [INFERRED 0.80]
- **Ship Gate Release Verification Flow** — testing_ship_gates_2026_04_06, testing_ship_gates_0_1_8, concept_release_gate_checklist [EXTRACTED 1.00]
- **CSV Export Features (Attention Queue, Deliverables Portfolio, Deals Portfolio)** — ux_attention_queue_csv_export, ux_deliverables_portfolio_csv_export, arch_deals_portfolio_csv_export [INFERRED 0.90]
- **Auth, Registration, and Session Cookie Flow** — arch_auth_and_rbac, arch_user_registration, concept_session_cookie [EXTRACTED 1.00]
- **Overdue Visibility Surfaces (Payment Overdue, Deliverable Overdue, Needs Attention, Attention Queue)** — concept_payment_overdue_state, concept_deliverable_overdue_state, concept_needs_attention_filter, concept_attention_queue [INFERRED 0.85]
- **CSV Export Pattern (UTF-8 BOM, session auth, row cap, attachment header)** — arch_payment_milestones_csv, arch_deliverables_csv, arch_attention_csv [EXTRACTED 1.00]
- **Intelligence Aggregation Pipeline (collectPriorityActions, dashboard, attention)** — concept_collectPriorityActionsFromDeals, concept_api_dashboard, concept_api_attention [EXTRACTED 1.00]
- **Overdue Detection System (computeIsOverdue, computeIsDeliverableOverdue, isOverdue at read time)** — concept_computeIsOverdue, concept_is_overdue_computed, concept_collectPriorityActionsFromDeals [EXTRACTED 0.95]
- **CSV Export Feature Set (Deals, Deliverables, Attention Queue)** — retro_deals_portfolio_csv_export, retro_deliverables_portfolio_csv_export, retro_attention_queue_csv_export [EXTRACTED 1.00]
- **Overdue Detection Pipeline (computeIsOverdue + collectPriorityActions + AttentionQueue)** — concept_compute_is_overdue, concept_collect_priority_actions, concept_attention_queue [EXTRACTED 0.95]
- **Monorepo Foundation Key Decisions (pnpm, Zod, FSM)** — rationale_pnpm_no_turborepo, rationale_zod_dual_boundary, rationale_fsm_server_enforced [EXTRACTED 1.00]
- **Payment Data Export Features (Invoice HTML, CSV Export, Deal Scoping)** — concept_invoice_html_builder, concept_payment_csv_export, retro_invoice_strict_deal_scoping_decision [INFERRED 0.80]
- **API Observability and Reliability (Health Endpoint, CORS Allowlist, Liveness)** — concept_health_endpoint, concept_cors_dev_allowlist, retro_health_liveness_only_decision [INFERRED 0.75]
- **Deal Creation UX Features (Brand Suggestions, Document Titles, Needs Attention Filter)** — concept_brand_suggestions_endpoint, concept_deals_list_metadata, concept_is_deals_needs_attention_filter [INFERRED 0.75]

## Communities

### Community 0 - "Forms & UI Components"
Cohesion: 0.03
Nodes (10): getBrowserApiBase(), paymentInvoiceAbsoluteUrl(), paymentInvoiceHref(), AttentionPage(), DealDetailPage(), getAttentionQueue(), getDeliverables(), getPayments() (+2 more)

### Community 1 - "Architecture Docs"
Cohesion: 0.05
Nodes (63): Attention Queue CSV Export Architecture, Attention Queue Architecture, Brand Directory Architecture, Brand Profiles Architecture, Deal Brand Suggestions Architecture, Dashboard Priority Actions Architecture, Deal CRUD Architecture, Deal Next-Action Prompt Architecture (+55 more)

### Community 2 - "API Layer & Auth"
Cohesion: 0.04
Nodes (61): API: POST /api/v1/auth/register, API: GET /api/v1/deals/brands, CHANGELOG.md: Release History, Auth & Tenancy: HTTP-only session cookie, Deal.userId, RBAC, Brand Name Datalist Suggestions, Brand Directory: /deals/brands with contracted totals per currency, Brand Profile Page (/deals/brands/[brandName]), PUT /api/v1/brands/:brandName Endpoint (+53 more)

### Community 3 - "UI Shell & Badges"
Cohesion: 0.04
Nodes (4): handleDismiss(), handleInstall(), isProtectedPath(), proxy()

### Community 4 - "Deal CRUD & Lifecycle"
Cohesion: 0.05
Nodes (53): Architecture: Deals Needs Attention Empty State, Dashboard API GET /api/v1/dashboard, Deal CRUD — Core Entity, getDealListEmptyContent() (deal-list-empty.ts), Deal Next-Action Prompt Feature, Deliverable Tracking — Content Commitments, Deals List Document Title, Deal List Empty State for needsAttention (+45 more)

### Community 5 - "API Handlers"
Cohesion: 0.06
Nodes (14): computeDominantCurrency(), createDeliverable(), exportAttentionCsv(), getAttention(), getDashboard(), loadDealsForAttention(), postLogin(), postLogout() (+6 more)

### Community 6 - "API Client"
Cohesion: 0.12
Nodes (1): ApiClient

### Community 7 - "Auth & Test Utilities"
Cohesion: 0.07
Nodes (0): 

### Community 8 - "AI Dev Workflow"
Cohesion: 0.07
Nodes (28): Agents Context Optimization: code-review-graph MCP First, Agents Mandatory 8-Step Execution Workflow, AGENTS.md: AI Agent Development Rules v1.3.0, code-review-graph MCP: Mandatory Before Bulk File Reads, Explainable AI: No Black-Box, Always Cite Data, Human-in-the-Loop for Money, Research First: No Research → No Development Hard Rule, Docs README: Architecture, UX, Decisions, Releases Index, Infra README: GitHub Actions CI/CD Workflows, PostgreSQL Setup (+20 more)

### Community 9 - "Deal FSM & Duplication"
Cohesion: 0.08
Nodes (24): API: POST /api/v1/deals/:id/duplicate, computeDealNextAction Function, Deal Duplication: Clone deal as DRAFT, clear dates and shareToken, Deal Status FSM (DRAFT→NEGOTIATING→ACTIVE→DELIVERED→PAID), Deal Next-Action Banner (computeDealNextAction), isValidStatusTransition, Decision: Deal Next-Action Prompt, Decision: Deal Duplication (+16 more)

### Community 10 - "CSV Export Pipeline"
Cohesion: 0.09
Nodes (22): API: GET /api/v1/attention/export, API: GET /api/v1/deals/export, API: GET /api/v1/deals/export/deliverables, Architecture: Deals Portfolio CSV Export, Attention Queue CSV Export, Attention Queue CSV Export, Deals Portfolio CSV Export, GET /api/v1/deals/export (+14 more)

### Community 11 - "PWA & Notifications"
Cohesion: 0.13
Nodes (22): Email-to-Deal Capture (Deferred Phase 2), Offline Banner (navigator.onLine), Payment Reminder Clipboard Copy, Push Notifications — Payment Overdue (Phase 1.5), PWA — Progressive Web App Shell, PWA Install Prompt (A2HS), Rate Benchmarking — Explainable Rate Floor (Phase 3), Scheduled Email Payment Reminders (Deferred Phase 2) (+14 more)

### Community 12 - "Testing & Accessibility"
Cohesion: 0.1
Nodes (21): API Integration Tests, aria-current Nav Accessibility (WCAG 2.2), Attention Queue Feature, Dashboard Priority Actions, Deal List needsAttention Filter, Server-Side Document Titles (generateMetadata), E2E Test Waiver (Phase 1), Payment isOverdue Logic (+13 more)

### Community 13 - "Overdue & Invoice Logic"
Cohesion: 0.13
Nodes (20): Attention Queue, collectPriorityActionsFromDeals (shared helper), computeIsOverdue (read-time derivation), CSV Export Utility, INV-######## Sequential Invoice Numbering, Rationale: Single source of truth for overdue in priority-actions.ts, Rationale: Deal-rows-only CSV export for v1 (fastest path), Rationale: Invoice number assigned on first open, not payment creation (+12 more)

### Community 14 - "Dashboard & Health"
Cohesion: 0.11
Nodes (18): Dashboard Financial Summary Cards, Add Deliverable Form Fields, Deliverable Overdue State, GET /api/v1/health Endpoint, Payment Overdue State, PWA Web Shell Global Navigation, Home Overview Unavailable Try Again, Rationale: Deliverables Section Above Payments (obligations before compensation) (+10 more)

### Community 15 - "PWA Shell & Infrastructure"
Cohesion: 0.12
Nodes (18): PWA Web Client Architecture, Boneyard Loading Skeletons, API CORS Plugin (cors.ts), Invoice HTML (Cache-Control: no-store), LoginForm Component, PWA Web Shell, Serwist PWA Service Worker, Rationale: Serwist network-only for /api/* (no stale financial data) (+10 more)

### Community 16 - "Attention Queue CSV"
Cohesion: 0.12
Nodes (17): GET /api/v1/attention/export Endpoint, GET /api/v1/attention Endpoint, GET /api/v1/deals/export/payments Endpoint, Decision: Attention Queue CSV Export, Decision: Attention Queue (Full Overdue List), Decision: Payment Milestones CSV Export, Instrumentation: Attention Queue, Instrumentation: Dashboard Priority Actions (+9 more)

### Community 17 - "Coverage Report Tooling"
Cohesion: 0.27
Nodes (11): addSortIndicators(), enableUI(), getNthColumn(), getTable(), getTableBody(), getTableHeader(), loadColumns(), loadData() (+3 more)

### Community 18 - "API Route Registry"
Cohesion: 0.15
Nodes (2): getApp(), handler()

### Community 19 - "Error Types"
Cohesion: 0.14
Nodes (6): AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (14): DEV_WEB_ORIGINS CORS Allowlist (port 3005, localhost, 127.0.0.1), HTML Invoice Builder (@oompa/utils deterministic builder), Payment Portfolio CSV Export Endpoint (/export/payments), Istanbul/NYC Coverage Report Favicon (yellow building/chart icon), Decision: Explicit CORS Allowlist for Dev (no arbitrary Origin reflection), Decision: No Production CORS Change in 0.1.8, Decision: 10k Payment Cap vs 5k Deals Cap for CSV Export, Decision: Nested Route /export/payments Under Deals Prefix (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.32
Nodes (11): assertCurrency(), buildPaymentInvoiceHtml(), customerBlock(), issuerBlock(), lineItemDescription(), optionalDateRow(), optionalNotesBlock(), paymentStatusDisplayLabel() (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.35
Nodes (8): a(), B(), D(), g(), i(), k(), Q(), y()

### Community 23 - "Community 23"
Cohesion: 0.24
Nodes (4): firstSearchParamValue(), getDealBrandFilter(), getDealStatusFilter(), isDealsNeedsAttentionFilter()

### Community 24 - "Community 24"
Cohesion: 0.24
Nodes (10): aria-current Page Nav Pattern, Deal Status Lifecycle, PriorityActionList Component, Browser UX Checklist: User Registration, UX: Attention Queue, UX: Dashboard Priority Actions, UX: Deal CRUD, UX: Deal Duplication (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 0.54
Nodes (6): buildDealsPortfolioCsv(), cell(), escapeCsvCell(), money(), optionalIso(), optionalNotes()

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (8): BrandProfileSchema, DealBrandSummarySchema, listDealBrands API Client Function, serializeBrandProfile Function, UpsertBrandProfileSchema, Test Plan: Brand Profiles, Test Plan: Deal Brand Suggestions, UX: Brand Directory

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (8): Architecture: Auth and RBAC, Architecture: User Registration, Fastify authenticate Pre-Handler, bcrypt Password Hashing, RBAC Roles (ADMIN/MEMBER), RegisterBodySchema (Zod), HTTP-Only Session Cookie, Rationale: Session Cookie over JWT localStorage (HTTP-only prevents XSS)

### Community 29 - "Community 29"
Cohesion: 0.62
Nodes (5): buildPaymentsPortfolioCsv(), cell(), money(), optionalIso(), optionalText()

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (4): buildDeliverablesPortfolioCsv(), cell(), optionalIso(), optionalText()

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (4): buildAttentionQueueCsv(), cell(), optionalMoney(), optionalStr()

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (6): Compensating Controls (E2E Waiver), E2E Browser Testing (Playwright/Cypress), Decision: Temporary E2E Waiver for Core Revenue Paths, Instrumentation: Auth & Tenancy Release 0.2.0, Instrumentation: User Registration, Rationale: No Playwright Committed, Waiver Unblocks Releases

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (6): Overview Unavailable Region (accessible section + live region + busy), PWA App Icon 192x192 (dark navy background, Oompa app icon), PWA App Icon 512x512 (dark navy background, Oompa app icon), Decision: Forward-Only Semver After 0.1.5, Decision: Research Lives in docs/product/ (Not ADRs), Retro: Release 0.1.6

### Community 35 - "Community 35"
Cohesion: 0.7
Nodes (4): goToNext(), goToPrevious(), makeCurrent(), toggleClass()

### Community 36 - "Community 36"
Cohesion: 0.4
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 0.4
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 0.4
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 0.5
Nodes (2): readPaymentInvoiceIssuerEnv(), splitLines()

### Community 40 - "Community 40"
Cohesion: 0.5
Nodes (5): GET /api/v1/deals/:id/payments/:id/invoice Endpoint, Sequential INV-######## Invoice Numbering, Decision: Payment Invoice HTML v1, Instrumentation: Payment Invoice HTML v1, Rationale: HTML Prints Cleanly, No PDF Dependencies

### Community 41 - "Community 41"
Cohesion: 0.4
Nodes (5): Architecture: Shareable Deal Proposal Link, DealProposalView (Public), Deal Share Token, Retro: Shareable Deal Proposal Link, UX: Shareable Deal Proposal Link

### Community 42 - "Community 42"
Cohesion: 0.6
Nodes (5): computeStatusCounts Function, deals-page.ts Library Module, getDealStatusFilter Function, Test Plan: Deal Pipeline Stage Strip, Test Plan: Deals List Document Title

### Community 43 - "Community 43"
Cohesion: 0.4
Nodes (5): Architecture: Payment Invoice HTML v1, buildPaymentInvoiceHtml() (@oompa/utils), Invoice Counter Singleton (invoice_counters table), Invoice Number Immutability (INV-########), Rationale: DB Counter + FOR UPDATE (deterministic global invoice sequence)

### Community 44 - "Community 44"
Cohesion: 0.5
Nodes (5): generateMetadata for Deals Page (Deals · Revenue / Needs attention · Revenue), isDealsNeedsAttentionFilter in lib/deals-page.ts, Decision: Centralize Query Parsing in lib/ (testable without RSC harness), Retro: Deals List Document Titles, Decision: Reuse Root title.template for Deals Page Titles

### Community 45 - "Community 45"
Cohesion: 0.5
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (2): expectedSessionTokenHash(), mockSessionFindUnique()

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 0.67
Nodes (4): Invoice Sequencing INV-* Numbers, Payment Invoice HTML Generation, Test Plan: Payment Invoice HTML v1, Ship Gates: Release 0.1.9 (2026-04-06)

### Community 49 - "Community 49"
Cohesion: 0.67
Nodes (4): Brand Suggestions Endpoint (/deals/brands, session-scoped distinct brands), Decision: groupBy + datalist for Brand Suggestions (zero-dependency UX), Decision: Silent Failure for Brand Suggestions (offline/degraded API), Retro: Deal Brand Suggestions

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 0.67
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Community 54"
Cohesion: 0.67
Nodes (3): Build vs Reject: Revenue/Risk + Automation + Simplest Viable System, Decision Priority: User Outcome > Determinism > Simplicity > Dev Velocity > Extensibility, Kill Criteria: No Revenue Impact in 2 Iterations, Cognitive Load, Non-Determinism

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (3): Deal Brand Suggestions Autocomplete, Instrumentation: Deal Brand Suggestions, Rationale: Brand Autocomplete Reduces Duplicate Brand Spellings

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (3): computeIsDeliverableOverdue Function, Deliverable Overdue Logic, Test Plan: Deliverable Tracking

### Community 57 - "Community 57"
Cohesion: 0.67
Nodes (3): Home Page Branching Logic, home-page.ts Library Module, Test Plan: Home Overview Unavailable State

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (3): PWA Offline Shell, Serwist Service Worker, Testing: PWA Web Client

### Community 59 - "Community 59"
Cohesion: 0.67
Nodes (3): Test Plan: Deliverables Portfolio CSV Export, UX: Deals Portfolio CSV Export, UX: Payment Milestones CSV Export

### Community 60 - "Community 60"
Cohesion: 0.67
Nodes (3): Release Gate Checklist, Ship Gates Run Log: Release 0.1.8, Ship Gates Run Log: 2026-04-06

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (3): Architecture: Deal Duplication, POST /api/v1/deals/:id/duplicate, Prisma Nested createMany (Deal Duplication)

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (3): API CORS Dev Origins Architecture, Fastify CORS Plugin, Rationale: Fixed List + Loopback Matcher vs origin:true in Dev CORS

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (3): Session Cookie Auth (HTTP-only, server-side rows), Rationale: Server-side session over JWT-in-localStorage, Retro: Auth Tenancy Release 0.2.0

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (3): Rationale: Single /api/v1/dashboard endpoint over N+1 fetches, Retro: Home Overview Unavailable State, Retro: Revenue Dashboard

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (2): Accessibility: WCAG 2.2 AA, Keyboard Operable Revenue Paths, Performance Budgets: Core Web Vitals, LCP, INP, CLS

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (2): Agent Roles: Planner, Researcher, Developer, Tester, Reviewer, Optimizer, Multi-Agent System: Planner, Researcher, Developer, Tester, Reviewer, Optimizer

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (2): Brand Directory Feature, Test Plan: Brand Directory

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (2): OverviewFetchError Component, Browser UX Checklist: Home Overview Unavailable State (2026-04-06)

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (2): Payment Reminder Message Builder, Test Plan: Payment Reminder Copy

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (2): INV Sequential Invoice Numbering, UX: Payment Invoice HTML v1

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (2): Copy Reminder Button, UX: Payment Reminder Copy

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (2): Main Nav aria-current Architecture, isMainNavCurrent Function

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (2): API v1 Health Endpoint Architecture, GET /api/v1/health Endpoint

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (2): Rationale: Clipboard first over email jobs for reminders, Retro: Payment Reminder Copy

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (0): 

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (0): 

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (0): 

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (0): 

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (0): 

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (0): 

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (0): 

### Community 88 - "Community 88"
Cohesion: 1.0
Nodes (0): 

### Community 89 - "Community 89"
Cohesion: 1.0
Nodes (0): 

### Community 90 - "Community 90"
Cohesion: 1.0
Nodes (0): 

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (0): 

### Community 92 - "Community 92"
Cohesion: 1.0
Nodes (0): 

### Community 93 - "Community 93"
Cohesion: 1.0
Nodes (0): 

### Community 94 - "Community 94"
Cohesion: 1.0
Nodes (0): 

### Community 95 - "Community 95"
Cohesion: 1.0
Nodes (0): 

### Community 96 - "Community 96"
Cohesion: 1.0
Nodes (0): 

### Community 97 - "Community 97"
Cohesion: 1.0
Nodes (0): 

### Community 98 - "Community 98"
Cohesion: 1.0
Nodes (0): 

### Community 99 - "Community 99"
Cohesion: 1.0
Nodes (0): 

### Community 100 - "Community 100"
Cohesion: 1.0
Nodes (0): 

### Community 101 - "Community 101"
Cohesion: 1.0
Nodes (0): 

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (0): 

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (0): 

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (0): 

### Community 105 - "Community 105"
Cohesion: 1.0
Nodes (0): 

### Community 106 - "Community 106"
Cohesion: 1.0
Nodes (0): 

### Community 107 - "Community 107"
Cohesion: 1.0
Nodes (0): 

### Community 108 - "Community 108"
Cohesion: 1.0
Nodes (0): 

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (0): 

### Community 110 - "Community 110"
Cohesion: 1.0
Nodes (0): 

### Community 111 - "Community 111"
Cohesion: 1.0
Nodes (0): 

### Community 112 - "Community 112"
Cohesion: 1.0
Nodes (0): 

### Community 113 - "Community 113"
Cohesion: 1.0
Nodes (0): 

### Community 114 - "Community 114"
Cohesion: 1.0
Nodes (0): 

### Community 115 - "Community 115"
Cohesion: 1.0
Nodes (0): 

### Community 116 - "Community 116"
Cohesion: 1.0
Nodes (1): Non-Negotiable Truths: Explainable, Testable, Reversible

### Community 117 - "Community 117"
Cohesion: 1.0
Nodes (1): Phase 4: Financial Infrastructure Layer

### Community 118 - "Community 118"
Cohesion: 1.0
Nodes (1): API Surface: /api/v1/deals, /payments, /deliverables, /share, /dashboard, /attention, /auth

### Community 119 - "Community 119"
Cohesion: 1.0
Nodes (1): Dev Setup: pnpm, API_URL rewrite, session cookie, port 3000/3001

### Community 120 - "Community 120"
Cohesion: 1.0
Nodes (1): Release 0.1.6: Home Overview Unavailable A11y + GitHub Actions CI/CD

### Community 121 - "Community 121"
Cohesion: 1.0
Nodes (1): Test Plan: GET /api/v1/health

### Community 122 - "Community 122"
Cohesion: 1.0
Nodes (1): PaymentStatus Enum

### Community 123 - "Community 123"
Cohesion: 1.0
Nodes (1): Sort Arrow Sprite (up/down triangle navigation arrows for lcov-report tables)

## Knowledge Gaps
- **189 isolated node(s):** `Core Principles (Outcome > Activity, Automation > Input, Clarity > Power)`, `Non-Negotiable Truths: Explainable, Testable, Reversible`, `Monorepo Structure (/apps/web, /apps/api, /packages/*)`, `Data Flow: Input → Validate → Normalize → Process → Output`, `Phase 3: Pricing + Negotiation Intelligence` (+184 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 65`** (2 nodes): `deliverable.ts`, `computeIsDeliverableOverdue()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (2 nodes): `html.ts`, `escapeHtml()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (2 nodes): `payment-invoice-template.ts`, `renderPaymentInvoiceDocument()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (2 nodes): `payment-reminder-message.ts`, `buildPaymentReminderMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (2 nodes): `sw.ts`, `apiV1NetworkOnly()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (2 nodes): `error.tsx`, `GlobalError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (2 nodes): `Accessibility: WCAG 2.2 AA, Keyboard Operable Revenue Paths`, `Performance Budgets: Core Web Vitals, LCP, INP, CLS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (2 nodes): `Agent Roles: Planner, Researcher, Developer, Tester, Reviewer, Optimizer`, `Multi-Agent System: Planner, Researcher, Developer, Tester, Reviewer, Optimizer`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (2 nodes): `Brand Directory Feature`, `Test Plan: Brand Directory`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (2 nodes): `OverviewFetchError Component`, `Browser UX Checklist: Home Overview Unavailable State (2026-04-06)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (2 nodes): `Payment Reminder Message Builder`, `Test Plan: Payment Reminder Copy`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (2 nodes): `INV Sequential Invoice Numbering`, `UX: Payment Invoice HTML v1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (2 nodes): `Copy Reminder Button`, `UX: Payment Reminder Copy`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (2 nodes): `Main Nav aria-current Architecture`, `isMainNavCurrent Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (2 nodes): `API v1 Health Endpoint Architecture`, `GET /api/v1/health Endpoint`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (2 nodes): `Rationale: Clipboard first over email jobs for reminders`, `Retro: Payment Reminder Copy`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `brand.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (1 nodes): `common.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (1 nodes): `dashboard.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (1 nodes): `deliverable.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (1 nodes): `deal.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (1 nodes): `common-auth.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (1 nodes): `brand.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (1 nodes): `payment.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (1 nodes): `base.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (1 nodes): `deliverables-csv.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (1 nodes): `currency.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (1 nodes): `html.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (1 nodes): `date.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (1 nodes): `payment-reminder-message.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (1 nodes): `deals-csv.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (1 nodes): `payments-csv.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (1 nodes): `attention-csv.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (1 nodes): `payment-invoice-html.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (1 nodes): `validation.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (1 nodes): `dom-lib-reference.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (1 nodes): `vitest-setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (1 nodes): `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 107`** (1 nodes): `server-api-fetch.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (1 nodes): `auth-cookie-name.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (1 nodes): `fastify-augment.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (1 nodes): `cors.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (1 nodes): `setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 113`** (1 nodes): `payment-invoice-env.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (1 nodes): `health.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (1 nodes): `Non-Negotiable Truths: Explainable, Testable, Reversible`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (1 nodes): `Phase 4: Financial Infrastructure Layer`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (1 nodes): `API Surface: /api/v1/deals, /payments, /deliverables, /share, /dashboard, /attention, /auth`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (1 nodes): `Dev Setup: pnpm, API_URL rewrite, session cookie, port 3000/3001`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (1 nodes): `Release 0.1.6: Home Overview Unavailable A11y + GitHub Actions CI/CD`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 121`** (1 nodes): `Test Plan: GET /api/v1/health`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 122`** (1 nodes): `PaymentStatus Enum`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 123`** (1 nodes): `Sort Arrow Sprite (up/down triangle navigation arrows for lcov-report tables)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Deal Lifecycle: DRAFT → NEGOTIATING → ACTIVE → DELIVERED → PAID (or CANCELLED)` connect `API Layer & Auth` to `Deal FSM & Duplication`, `Architecture Docs`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `Brand Directory: /deals/brands with contracted totals per currency` connect `API Layer & Auth` to `PWA & Notifications`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `Deal CRUD Architecture` connect `Architecture Docs` to `API Layer & Auth`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Needs Attention Filter — Overdue Deal Filter` (e.g. with `Dashboard Priority Actions — What to Do Next` and `Deal Pipeline Stage Strip — Status Filter UI`) actually correct?**
  _`Needs Attention Filter — Overdue Deal Filter` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Core Principles (Outcome > Activity, Automation > Input, Clarity > Power)`, `Non-Negotiable Truths: Explainable, Testable, Reversible`, `Monorepo Structure (/apps/web, /apps/api, /packages/*)` to the rest of the system?**
  _189 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Forms & UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Architecture Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._