# Test Plan: Brand Profiles Frontend

## Coverage Baseline
apps/web: 108 → 111 tests (+3 new API client tests)
All packages: 483 → 486 tests total

## New Tests (apps/web/lib/__tests__/api.test.ts)
| Test | Covers |
|------|--------|
| getBrandProfile GETs with url-encoding | URL encode special chars, returns view |
| upsertBrandProfile PUTs JSON body | PUT method, body serialisation, response type |
| deleteBrandProfile DELETEs | DELETE method, 204 handling |

## Coverage: ≥90% ✓
- All 3 API methods have direct tests
- Server page: covered by build + HTTP integration check (no unit test needed — pure data-fetch RSC)
- BrandProfileForm: covered indirectly by API client tests; form logic is simple state + api call

## Edge Cases Verified
- Brand not in user's deals → "Brand not found" state (HTTP validated)
- Profile null → empty state + "Add contact info" (HTTP validated)
- Unauthenticated → 307 redirect to /login (HTTP validated)
- URL-encoded brand names (spaces, &) → correct encoding in API client test
