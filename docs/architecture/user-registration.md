# Architecture: User Registration

## Module: Auth

## Data Flow
Input (email, password) → Validate (RegisterBodySchema: email format, password min 8) → Normalize (email.toLowerCase()) → Process (bcrypt hash, prisma user.create, session token, cookie) → Output (201 { data: { id, email, roles } })

## Data Model Changes
No schema changes required — User model (passwordHash, roles Role[], sessions Session[]) and Session model (tokenHash, expiresAt) were already in place from auth-tenancy v0.2.0.

## API Contract
POST /api/v1/auth/register
- Body: { email: string (valid email), password: string (min 8 chars) }
- Success: 201 { data: { id: string, email: string, roles: Role[] } } + Set-Cookie: session=<token>; HttpOnly; SameSite=Lax
- Error 400: { message: string } — validation failure (invalid email, short password, missing fields)
- Error 409: { message: "Email already in use" } — duplicate email

## Events
Emits: none (Phase 2: would emit user.registered for welcome email)
Consumes: none

## Scale Analysis
bcrypt cost factor: default (12 rounds). At 100 concurrent registrations, bcrypt is the bottleneck (~300ms/hash). Acceptable at Phase 1 scale. At 10,000 concurrent: would need async worker offload (Phase 2 BullMQ).
Email uniqueness: enforced by DB unique index on User.email. Prisma unique constraint error → 409.
Session token: cryptographically random, stored as SHA-256 hash in DB.

## Tech Choices
| Choice | Alternatives | Why This |
|--------|-------------|----------|
| bcrypt | argon2, scrypt | Already used for login; consistent; well-supported in Node.js |
| Session cookie | JWT localStorage | Matches existing auth pattern; HTTP-only prevents XSS token theft |
| Zod RegisterBodySchema | Manual validation | Consistent with all other API schemas; type-safe |

## Operational Design
Deploy: standard Vercel pipeline (apps/api + apps/web).
Monitoring: watch for 409 spike (duplicate email attempts) and 400 spike (bot form submissions).
Rollback: remove POST /register route from apps/api/src/routes/auth/index.ts — no DB migration rollback needed (no schema changes).
