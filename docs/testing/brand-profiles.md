# Test Plan: Brand Profiles

## Coverage Baseline
No brand profile tests exist (new feature). Existing brand tests in packages/types deal.test.ts cover DealBrandSummary only.

## Test Cases
| Scenario | Type | Expected | Risk |
|----------|------|----------|------|
| BrandProfileSchema parses valid profile | Unit | passes | Low |
| BrandProfileSchema accepts null contact fields | Unit | passes | Low |
| UpsertBrandProfileSchema all optional | Unit | passes | Low |
| UpsertBrandProfileSchema validates email format | Unit | throws | Medium |
| UpsertBrandProfileSchema allows null to clear email | Unit | null accepted | Medium |
| UpsertBrandProfileSchema rejects phone >50 chars | Unit | throws | Low |
| BrandProfileStatsSchema parses valid stats | Unit | passes | Low |
| BrandProfileStatsSchema rejects negative totalDeals | Unit | throws | Low |
| serializeBrandProfile serializes dates to ISO | Unit | ISO string | Low |
| serializeBrandProfile preserves nullable fields | Unit | null | Low |
| serializeBrandProfile preserves brandName + notes | Unit | correct values | Low |

## Edge Cases
- brandName with spaces and special chars (URL encoding/decoding)
- User tries to access another user's brand profile (unauthorized → 404, not 403)
- Brand exists in deals but no profile created yet (GET returns profile: null)
- Brand name doesn't match any deal (GET returns 404)
- PUT with empty body (all optional → profile with null contact fields)
- DELETE profile that doesn't exist (idempotent → 204)

## Failure Mode Tests
- DB unavailable → 500 with proper error shape
- brandName too long (>255 chars) → 400 validation error

## Coverage Target
≥90% on: packages/types/src/brand.ts, apps/api/src/routes/brands/service.ts
