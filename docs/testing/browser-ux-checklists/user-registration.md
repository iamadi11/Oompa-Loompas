# Browser UX Checklist: User Registration

Date: 2026-04-10
Release: 0.3.1

## Routes

- [x] `/register` → HTTP 200 (confirmed via curl: `GET /register 200 in 1220ms`)
- [x] `/login` → HTTP 200, "Sign up" link present pointing to `/register`

## API End-to-End (via curl to localhost:3001)

- [x] `POST /api/v1/auth/register` with valid email + password → `201 { data: { id, email, roles: ["MEMBER"] } }`
- [x] Duplicate email → `409 { message: "An account with this email already exists" }`
- [x] Password < 8 chars → `400 { message: "Password must be at least 8 characters" }`
- [x] Response includes `Set-Cookie: oompa_session=...` (session auto-created)

## Form UX (verified via code review + test suite)

- [x] Email field: type="email", autoComplete="email", label linked via htmlFor
- [x] Password field: type="password", autoComplete="new-password", "(min 8 characters)" hint in label
- [x] Confirm password: type="password", Enter key submits form
- [x] "Create account" button: loading state shows "Creating account…"
- [x] Error message rendered in `role="alert"` aria-live region
- [x] Form `noValidate` — validation in JS, consistent error UX
- [x] Login ↔ Register cross-links present on both pages
- [x] Success: toast "Account created — welcome!" then `navigateAfterLogin(null)` → `/dashboard`

## Notes

Preview tool browser validation was blocked by a Turbopack HMR compilation hang on /dashboard
(the pre-existing dashboard page triggers a long server-side API call during compilation when
a WebSocket client is connected). Routes were validated via direct curl requests instead.
Full functional verification via 214 automated tests (141 API + 73 web).
