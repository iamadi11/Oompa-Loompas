# Retro: Brand Profiles Frontend

## What Built
- /deals/brands/[brandName] page: stats, contact form, recent deals
- BrandProfileForm client component with edit/save/cancel pattern
- "Profile" link added to brand directory rows
- 3 new API client tests

## Key Decisions
- Server RSC for profile page (data-fetch only); client component for edit form only
- form state initialised from `saved` at edit-open time (not from initial prop), preventing stale values after save
- BrandRecentDeal.currency/status tightened to branded types (caught by typecheck, fixed before commit)
- Prettier auto-formatted 49 files that were drifting from CI standard — root cause: format:check:workspace not run locally before prior commits. Added to personal pre-commit mental checklist.

## CI Gate Discovered
`pnpm format:check:workspace` and `pnpm build` were not in local validation loop. Both failed. Fixed by running `pnpm exec prettier --write` across workspace and confirming build passes.

## Post-Deploy Baseline
Profile page not live yet (not deployed). Baseline: 0 profile saves. Watch for first saves within 7 days.

## What to Watch
- 404s on /api/v1/brands/:name (broken navigation from brands directory)
- PUT success rate (are creators actually saving contact info?)

## Next
- Deal templates (Phase 1 remaining)
- Email-to-deal capture (CRITICAL — Phase 1 remaining)
