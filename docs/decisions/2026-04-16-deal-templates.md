# Decision: Deal Templates

**Date:** 2026-04-16  
**Phase:** Phase 1 — Deal + Payment Intelligence  
**Status:** APPROVED

## What

Named, reusable deal structures that creators can define once and use to pre-fill new deals.

A template captures:
- Name (e.g. "YouTube Integration Standard")
- Default value + currency
- Deliverable list (title, type, description, relative due offset in days from deal start)
- Payment milestone list (label, percentage of total, relative due offset in days)
- Optional notes

Templates live at `/deals/templates`. Creating a new deal shows a "Use template" picker that pre-fills the form. Existing deals have a "Save as template" action.

## Why Now

- Brand profiles (CRM lite) shipped 2026-04-16 — Phase 1 nearly complete
- Retro explicitly flagged deal templates as next
- Deal duplication (0.4.0) shows appetite for reducing creation friction
- No new infrastructure needed (pure CRUD, no new infra dependencies)

## Why Not Alternatives

- **Email-to-deal capture**: CRITICAL but requires email ingestion infra — Phase 2 scope
- **Scheduled payment reminders (email to client)**: Requires SMTP + brand contact opt-in — Phase 2 scope
- **Enhanced push reminders**: Push 0.4.7 already covers overdue alerts; marginal delta

## User Without This

Karan (₹60K/month, recurring brand campaigns) either:
1. Starts from scratch every deal: ~5 minutes of repetitive form filling
2. Duplicates a past deal: requires having one, creates DRAFT clutter in pipeline, 30–60s of editing

Templates differ from duplication:
- Intentional named presets vs ad-hoc copy
- No pipeline clutter (templates are not deals)
- Work before any deal exists (new creators)
- Reusable forever without finding the right deal to clone

## Success Criteria

1. Creator creates a named template with deliverables + payment milestones in ≤3 minutes
2. "New deal from template" pre-fills form in ≤2 taps, zero redundant fields
3. "Save as template" from existing deal in 1 tap
4. Template list at `/deals/templates` with edit + delete
5. All zero/error/success states covered

## Assumptions

- Templates are user-scoped (not shareable between users in Phase 1)
- Relative due dates ("7 days from start") rather than absolute dates (deal-specific)
- No image/file attachments (Phase 2)
- Maximum 20 templates per user (prevents abuse, surfaceable in UI)
