# Decision: User Registration
Date: 2026-04-09
Phase: Phase 1 (completion)
Status: APPROVED

## What
Self-serve user registration via POST /api/v1/auth/register: validates email + password (min 8 chars), hashes password with bcrypt, creates user with MEMBER role, auto-creates session, sets HTTP-only session cookie, returns 201 with { data: { id, email, roles } }. Web layer: /register page with RegisterForm (email, password, confirm password, ARIA-invalid, role="alert" error output, keyboard accessible). Login page gets "Don't have an account? Sign up" link.

## Why Now
The Vercel deployment infrastructure just shipped (previous 2 commits). Without registration, zero new users can access the deployed app — all users require manual DB seeding. Registration is the prerequisite for every product metric, user acquisition, and revenue measurement. Passes all build criteria: increases revenue (enables user acquisition), reduces manual effort (no DB seeding), is simplest viable system.

## Why Not OAuth only
Phase 1 target users are solo creators — adding OAuth requires integrating a third-party provider, additional redirect flows, and more complex session handling. Email/password is faster to ship and directly usable by the target user without external dependencies.

## Why Not Email verification step
Email verification adds friction that slows first-run conversion. Phase 1 prioritizes getting users into the product; rate-limiting and email verification are Phase 2 hardening items. The risk (fake accounts) is low at Phase 1 scale.

## User Without This Feature
1. Creator discovers the app
2. Goes to /login
3. Has no account — no way to register
4. Leaves or contacts developer to manually seed an account in the DB
5. Never returns

## Success Criteria
- New user can complete /register → /app in under 30 seconds
- 409 on duplicate email is surfaced clearly
- Session is established immediately after register (no separate login step)
- /login page links to /register; /register page links to /login
- All auth tests pass (20/20)

## Assumptions (to be validated)
- Solo creators are comfortable with email/password auth
- Auto-login on register reduces friction vs. requiring a separate login step
