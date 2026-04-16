# Decision: Brand Profiles Frontend (CRM lite)

Date: 2026-04-16  
Phase: Phase 1 — Deal + Payment Intelligence  
Status: APPROVED

## What

Individual brand profile page at `/deals/brands/[brandName]` surfacing:
- Contact info (email, phone) — editable inline
- Notes (free text, max 5 000 chars) — editable inline
- Stats: total deals, contracted totals per currency, overdue payments count
- Recent deals list (last 5) with links to deal detail

## Why Now

- API fully implemented (`GET/PUT/DELETE /api/v1/brands/:brandName`); zero backend work required
- Brand types exist in `@oompa/types`
- Brand directory page (`/deals/brands`) already links naturally to a profile destination
- "Client/brand profiles (CRM lite)" is a Phase 1 remaining item blocking Phase 1 completion
- Each uncaptured contact detail is a reminder the creator has to dig from email/phone manually

## Why Not Alternatives

- **Email-to-deal capture**: highest-leverage Phase 1 item but requires email infra (SMTP, parsing) — out of scope without backend groundwork first
- **Deal templates**: lower urgency; no brand relationship context
- **Scheduled payment reminders (upcoming)**: useful but push infra already handles overdue; upcoming reminders are an incremental job change, not a UX surface

## User Without This

Creator looks up a brand's contact, opens phone contacts or email thread, copies phone number, pastes into reminder message. Notes on brand payment reliability exist only in memory.

## Success Criteria

1. Creator can navigate from `/deals/brands` → brand profile page in ≤2 taps
2. Contact email + phone fields save on blur / submit
3. Notes field saves on submit
4. Overdue payments count visible at a glance (red badge if > 0)
5. Recent deals list links to deal detail
6. All states covered: no profile yet, profile exists, error

## Assumptions

- Brand profiles are keyed by `brandName` string (case-sensitive in DB; case-insensitive search in API)
- Profile is optional — brands may exist without one
- No image/logo upload (Phase 2)
