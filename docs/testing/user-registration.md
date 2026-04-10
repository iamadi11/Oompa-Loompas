# Test Plan: User Registration

## Coverage Baseline
Before this work: POST /register route did not exist. Login/logout/me tests existed.

## Test Cases (all in apps/api/src/__tests__/auth.test.ts)
| Scenario | Type | Expected | Risk Level |
|----------|------|----------|-----------|
| Valid email + password | Integration | 201, session cookie, { id, email, roles } | High |
| Email normalized to lowercase | Integration | 201, email stored lowercase | Medium |
| Duplicate email | Integration | 409 { message: "Email already in use" } | High |
| Password < 8 chars | Integration | 400 validation error | Medium |
| Invalid email format | Integration | 400 validation error | Medium |
| Missing fields | Integration | 400 validation error | Low |
| register() in ApiClient | Unit | POSTs to /api/v1/auth/register with body | Medium |

## Edge Cases
- Email case: "User@EXAMPLE.com" stored as "user@example.com" — prevents duplicate accounts from case variants
- Auto-login: session cookie is set in the same response as 201 — no second request needed
- RBAC: new users receive MEMBER role, not ADMIN

## Coverage Target
≥90% on: apps/api/src/routes/auth/handlers.ts, apps/api/src/routes/auth/index.ts, apps/web/lib/api.ts
Achieved: API 94.38%, Web 98.44%
