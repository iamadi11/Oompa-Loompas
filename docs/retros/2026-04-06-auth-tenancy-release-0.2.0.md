# Retro: Auth, tenancy, workspace shell (0.2.0)

Shipped: 2026-04-06

## What was built

Session-backed **login/logout/me**, **Prisma tenancy** on deals, **protected Fastify v1 routes**, **Next.js marketing + workspace split** with **middleware**, **RBAC UI** (admin link + logout), **cookie-clearing fix** for logout, **deal status dropdown** aligned to server transition rules, and **scroll-padding** for the sticky shell.

## Decisions (and why)

- **Server-side session rows + cookie** over JWT-in-localStorage: revocation and HTTP-only preference for money-adjacent data.
- **Seed-only admin** for empty DBs: fastest path for staging/dev without email infra.
- **Same-origin API rewrites** in Next when `NEXT_PUBLIC_API_URL` is unset: simpler cookie story on one origin.

## Critic user (honest)

- First-time creators still need a **clear “who gave me credentials?”** story until self-serve registration exists.
- **Status transitions** confused power users when the API rejected “Draft → Active”; the UI now hides impossible steps.

## What to watch

- **401/403** volume and **login failures** after each deploy (env drift).  
- **Migration failures** on existing DBs (must run before API).

## What we’d do differently next time

- Ship **release notes + version bump** in the same merge as the feature branch to avoid a long “invisible” unreleased state on `main`.
