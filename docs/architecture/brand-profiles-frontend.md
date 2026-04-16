# Architecture: Brand Profiles Frontend (CRM lite)

## Module
Deal module — brand sub-feature. No new module.

## Data Flow
Browser → GET /api/v1/brands/:brandName (server RSC fetch, no-store)
→ BrandProfileView { brandName, profile|null, stats, recentDeals[] }

Edit: Browser → PUT /api/v1/brands/:brandName (client fetch via ApiClient)
→ BrandProfile (upserted)

## New Files
- apps/web/app/(workspace)/deals/brands/[brandName]/page.tsx — Server RSC, metadata, 404 handling
- apps/web/components/brands/BrandProfileForm.tsx — Client component, edit form, optimistic state

## Modified Files
- apps/web/app/(workspace)/deals/brands/page.tsx — "Profile" link added per brand row
- apps/web/lib/api.ts — BrandRecentDeal.currency and .status tightened to Currency / DealStatus
- apps/web/lib/__tests__/api.test.ts — 3 new tests for getBrandProfile, upsertBrandProfile, deleteBrandProfile

## Schema Changes
None. BrandProfile model and API routes existed since v0.4.7.

## API Contract
GET /api/v1/brands/:brandName → { data: BrandProfileView }
PUT /api/v1/brands/:brandName → { data: BrandProfile }
DELETE /api/v1/brands/:brandName → 204
All authenticated (session cookie).

## Routing
/deals/brands/[brandName] — dynamic server-rendered route.
Profile may be null (brand exists in deals but no contact info saved yet).

## Scale
Single brand fetch per page load. No caching — profile is mutable (creator-edited).
