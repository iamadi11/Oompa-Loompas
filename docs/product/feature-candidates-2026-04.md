# Feature candidates — research snapshot (April 2026)

**Authority:** [SOURCE_OF_TRUTH.md](../../SOURCE_OF_TRUTH.md) — outcome engine only; no dashboard-for-dashboard’s-sake.

**Sources:** Public positioning of creator deal tools (e.g. proposal → sign → invoice → reminder loops), payment visibility, and SOT evolution phases (Deal + Payment → Workflow → Pricing → Financial infra).

## Build filter (every candidate)

Ship only if **all** hold: increases revenue or reduces risk; automates or removes manual work; simplest system that works.

## Ranked candidates (next releases)

| Rank | Capability | User outcome | Module fit | Complexity |
|------|------------|--------------|------------|------------|
| 1 | **Invoice artifact from deal / payment** | Faster payment, fewer “send me an invoice” round-trips | Payment (+ optional Deliverable line items) | Medium — PDF or HTML export, numbering, audit fields |
| 2 | **Deterministic payment reminders** | Fewer overdue receivables | Notification (+ reads Payment) | Medium — schedules, templates, explicit consent |
| 3 | **Shareable scope / proposal link** (no full CRM) | Close deals faster | Deal | Medium — single artifact, status, optional brand view |
| 4 | **Deal stage pipeline** (minimal, not Kanban theater) | Orientation + “what’s stuck” | Deal / Intelligence | Low–medium — statuses already partially exist |
| 5 | **Explainable rate floor suggestion** | Better negotiation, less underpricing | Intelligence | High — rules-first before ML; needs enough history |

## Explicit non-goals (for now)

- Generic **brand CRM** or contact graph — violates “not a CRM” unless tightly tied to revenue timing.
- **Black-box “AI pricing”** — violates trust > intelligence until every output is explainable and testable.

## What the codebase already covers (baseline)

Deals, payments, deliverables, dashboard summaries, **attention** queue for overdue work, PWA shell rules, and **home overview** trust states (unavailable vs empty vs ready).

## Recommended next engineering epic

**Epic A — “Get paid”:** invoice generation (v1: deterministic fields from deal + payment milestones) → optional send/export → reminder jobs (v2).

**Shipped slice (2026-04-06):** HTML invoice per payment milestone — [docs/decisions/2026-04-06-payment-invoice-html-v1.md](../decisions/2026-04-06-payment-invoice-html-v1.md).

Document each slice with a decision record before implementation ([docs/decisions/](../decisions/)).
