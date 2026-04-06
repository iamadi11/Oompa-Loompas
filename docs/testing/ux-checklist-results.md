# UX / PWA checklist run log

Date: **2026-04-06** — **Latest agent pass (Browser MCP + curl + automated tests)**

**Environment:** API `http://127.0.0.1:3001`, Web `http://127.0.0.1:3000` — `pnpm --filter @oompa/api dev` + `apps/web` with `API_URL` / `NEXT_PUBLIC_API_URL=http://127.0.0.1:3001` and **`next dev --webpack`** (required on Next.js 16 with `@ducanh2912/next-pwa`; plain `next dev` exits — see [`apps/web/package.json`](../../apps/web/package.json)).

**Auth fixture:** `dev-browser-test@local.test` password rotated for automation (DB `users` row). **Do not** commit secrets; use your own seed user locally.

---

## Cursor Browser MCP (`http://127.0.0.1:3000`) vs [web-shell-pwa.md](../ux/web-shell-pwa.md) / [pwa-web-client.md](./pwa-web-client.md)

| Check                            | Result             | Notes                                                                                                                                                                                                                                                                                         |
| -------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing `/` — skip link        | **Pass**           | "Skip to main content" in snapshot                                                                                                                                                                                                                                                            |
| Marketing `/` — CTAs             | **Pass**           | Log in, Open your workspace, How it works                                                                                                                                                                                                                                                     |
| Marketing `/` — hero / tagline   | **Pass**           | "Financial outcome engine for creators." + outcome headline                                                                                                                                                                                                                                   |
| `/offline` — copy                | **Pass**           | H1 "You are offline"; deals/payments/balances need connection; **Try home** link                                                                                                                                                                                                              |
| `/offline` — document title      | **Pass**           | `Offline · Oompa`                                                                                                                                                                                                                                                                             |
| `/login` — shell                 | **Pass**           | Oompa Loompas link, Email/Password, Sign in, Back to product page                                                                                                                                                                                                                             |
| **Sign in** via MCP click + fill | **Fail (tooling)** | No `fetch` to `/api/v1/auth/login` observed; **do not use `browser_lock`** before MCP interactions (blocks automation). **Human / Playwright:** expect Pass with [`LoginForm`](../../apps/web/components/auth/LoginForm.tsx) (reads `form.elements`, `onClick` + `onSubmit` both call login). |
| Protected deal URL logged out    | **Pass**           | `/deals/00000000-…` → middleware → `/login?from=…` (auth gate)                                                                                                                                                                                                                                |
| `next/link` client nav in MCP    | **Partial**        | Per prior runs: prefer **`browser_navigate`** for route changes                                                                                                                                                                                                                               |

---

## Engineering fixes from this pass

| Item                                 | Change                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`next dev` crash (Next 16 + PWA)** | [`apps/web/package.json`](../../apps/web/package.json) — `dev` / `dev:clean` use **`next dev --webpack`** (same reason as production `next build --webpack`).                                                                                                                                                                                                 |
| **Login GET leaked credentials**     | Controlled inputs + tooling filled DOM only → native **GET** `?email=&password=`; fixed by reading **`readNamedInput`** from the form node + **`onClick` on Sign in** (MCP) + **`onSubmit` for Enter**. See [`LoginForm.tsx`](../../apps/web/components/auth/LoginForm.tsx), [`lib/forms/read-named-input.ts`](../../apps/web/lib/forms/read-named-input.ts). |
| **`browser_lock` + MCP**             | Lock overlay blocked automated clicks; run MCP **unlocked** unless user needs control handoff.                                                                                                                                                                                                                                                                |

---

## `docs/ux/web-shell-pwa.md` (behavioral)

| Criterion             | Result                   | Evidence                                                           |
| --------------------- | ------------------------ | ------------------------------------------------------------------ |
| Palette / type        | **Pass**                 | Chocolate / parchment / gold tokens + Cormorant Garamond + DM Sans |
| Reduced motion        | **Pass (code)**          | `globals.css` + `useReducedMotion` on motion components            |
| PWA tasks not blocked | **Pass**                 | No install gate on marketing/offline                               |
| Focus / keyboard      | **Partial (MCP)**        | Full tab order: real Chrome                                        |
| Offline messaging     | **Pass**                 | `/offline`                                                         |
| `aria-current` / nav  | **Not re-run logged-in** | Prior runs + code: Overview / Deals current rules unchanged        |

---

## `docs/testing/pwa-web-client.md`

| Criterion                             | Result              | Notes                                                                                                                                    |
| ------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @oompa/web verify:pwa` | **Pass**            | Manifest source + icons                                                                                                                  |
| `pnpm --filter @oompa/web build`      | **Pass**            | CI / local before release                                                                                                                |
| SW in **dev**                         | **Pass (expected)** | Webpack dev log: **"PWA support is disabled."**                                                                                          |
| DevTools / Lighthouse                 | **Not run**         | Use `next start` after `build`                                                                                                           |
| Font preload console noise            | **Minor**           | DevTools may warn preloaded `woff2` "not used within a few seconds" on some routes — cosmetic; track upstream `next/font` if it persists |

---

## API breaking points (curl, `http://127.0.0.1:3001` and rewrite via `:3000`)

| Request                                                      | Expected | Result (this pass)                                          |
| ------------------------------------------------------------ | -------- | ----------------------------------------------------------- |
| `GET /api/v1/deals` (no cookie)                              | 401      | **Pass**                                                    |
| `GET /api/v1/health`                                         | 200      | **Pass**                                                    |
| `GET /api/v1/admin/ping` (no cookie)                         | 401      | **Pass**                                                    |
| `POST /api/v1/auth/login` `{}`                               | 400      | **Pass**                                                    |
| `POST /api/v1/auth/login` bad password (valid shape)         | 401      | **Pass**                                                    |
| Session: login → `GET /api/v1/deals` via **`:3000` rewrite** | 200      | **Pass**                                                    |
| `POST /api/v1/auth/logout` `{}` via **`:3000` rewrite**      | 204      | **Pass**                                                    |
| `GET /api/v1/deals` after logout                             | 401      | **Pass**                                                    |
| `GET /manifest.webmanifest`                                  | 200 JSON | **Pass** — `name` **Oompa Loompas**, `short_name` **Oompa** |

---

## Automated

| Area           | Result                             |
| -------------- | ---------------------------------- |
| `pnpm -r test` | **Pass**                           |
| `pnpm -r lint` | **Pass** (web checked post-change) |

---

## Follow-up (human)

1. **Production:** `pnpm --filter @oompa/web build && pnpm --filter @oompa/web start` — SW registration, Lighthouse, offline fetch behavior per [pwa-web-client.md](./pwa-web-client.md).
2. **Real Chrome:** Logged-in shell, **Deals · Oompa** / **Needs attention · Oompa** titles, deal CRUD, `confirm()` deletes, invoice `target=_blank`.
3. **MCP:** Re-try login **without** `browser_lock`; if still no `fetch`, treat as Cursor browser limitation, not product regression.

---

## Earlier log (2026-04-06 — auth + CRUD MCP, pre–Next 16 webpack dev fix)

Environment: `pnpm --filter @oompa/api dev` + `pnpm --filter @oompa/web dev` (ports **3001** / **3000**). Prefer **`http://127.0.0.1:3000/`** for MCP (avoids odd history / client quirks vs `localhost`).

**Local DB:** Run `pnpm --filter @oompa/db exec prisma migrate deploy` with `DATABASE_URL` set (e.g. from `apps/api/.env`) before first auth test. Use a real user for login (seed with `SEED_ADMIN_*` when the DB has no deals, or upsert a dev user).

### Cursor Browser MCP and the dev URL

| Check                             | Result      | Notes                                                                                                                   |
| --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `http://127.0.0.1:3000/`          | **Pass**    | Logged-out: marketing landing + CTAs. Logged-in: middleware redirects to `/dashboard`.                                  |
| `http://127.0.0.1:3000/login`     | **Pass**    | Email/password, Sign in, skip link, back link (when reachable without session).                                         |
| Client `Link` click vs `navigate` | **Partial** | Some MCP clicks on marketing **Log in** did not change URL; **full navigation** to `/login` is reliable for automation. |

### MCP manual pass (auth + CRUD + CTAs) — `http://127.0.0.1:3000`

| Flow                       | Result      | Notes                                                                                                                                          |
| -------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing `/` (logged out) | **Pass**    | Document title + hero; **Log in**, **Open your workspace**, **How it works**; skip link.                                                       |
| Login page `/login`        | **Pass**    | Email, Password, **Sign in**, **Back to product page** (MCP after logout).                                                                     |
| Login → session            | **Pass**    | POST via same-origin `/api/v1/...` rewrite; redirect to `/dashboard`.                                                                          |
| Log out                    | **Pass**    | MCP: **Signing out…** → full navigation to `/login` with **Sign in** visible; API clears cookie (`POST` `{}` + `204` through `:3000` rewrite). |
| Overview `/dashboard`      | **Pass**    | Summary cards, recent deals, New deal, View all; Admin + Log out when `ADMIN`.                                                                 |
| Deals list `/deals`        | **Pass**    | All / Needs attention, Add deal, deal cards.                                                                                                   |
| New deal `/deals/new`      | **Pass**    | Required fields + currency + notes; **Create deal** → redirect to deal detail (MCP end-to-end smoke).                                          |
| Deal detail — payment      | **Pass**    | Add payment; Mark received; summary updates (Received / Outstanding).                                                                          |
| Deal detail — deliverable  | **Pass**    | Add deliverable (`scroll-padding-top` on `html` for sticky header).                                                                            |
| Payment delete             | **Not run** | `confirm()` non-blocking in MCP — use real Chrome for dialog UX.                                                                               |
| Edit deal (valid status)   | **Pass**    | Notes save; invalid transitions rejected by API; UI limits status dropdown in edit mode.                                                       |
| Delete deal                | **Not run** | Same as confirm flows in MCP.                                                                                                                  |
| Attention `/attention`     | **Pass**    | Caught-up empty state; Back to overview → `/dashboard`.                                                                                        |
| Admin `/admin`             | **Pass**    | RBAC probe copy for `ADMIN`.                                                                                                                   |
| Offline `/offline`         | **Pass**    | Copy + Try home (`/`).                                                                                                                         |

### Engineering fixes from earlier run

| Item                            | Change                                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Sticky header vs scroll targets | `apps/web/app/globals.css` — `scroll-padding-top: 5.5rem` on `html`.                                                          |
| Logout cookie not cleared       | `apps/api/src/routes/auth/handlers.ts` — shared `sessionCookieBaseOptions()` for `setCookie` + `clearCookie` (prior release). |
| Logout POST 400 in browser      | `apps/web/lib/api.ts` — `logout()` sends `JSON.stringify({})` so Fastify accepts `application/json`.                          |
| Logout navigation / middleware  | `apps/web/components/shell/ShellAuthActions.tsx` — `window.location.assign('/login')` after logout.                           |
| Duplicate `aria-current`        | `apps/web/components/shell/MainNav.tsx` — brand link no longer sets `aria-current` (only **Overview** does).                  |
| Impossible deal status in UI    | `apps/web/components/deals/DealForm.tsx` — status `<Select>` from `DEAL_STATUS_TRANSITIONS` in edit mode (prior release).     |

### `docs/ux/web-shell-pwa.md` (historical behavioral)

| Criterion                           | Result                 | Evidence                                                                                                          |
| ----------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Restrained palette, type hierarchy  | **Pass**               | Observed on marketing + workspace pages.                                                                          |
| Display + body fonts                | **Updated**            | Now Cormorant Garamond + DM Sans (was Fraunces + Source Sans 3).                                                  |
| Reduced motion                      | **Pass (code)**        | `globals.css` + Tailwind `motion-reduce:*`.                                                                       |
| No purple-gradient cliché           | **Pass**               | Warm canvas + brand accent.                                                                                       |
| PWA tasks not blocked by install    | **Pass**               | No install gate.                                                                                                  |
| Focus / keyboard                    | **Pass (partial MCP)** | Focus rings on controls; full tab order in real Chrome still recommended.                                         |
| Money paths network-backed          | **Pass (code)**        | `cache: 'no-store'` on server `serverApiFetch`; client API uses `credentials: 'include'`.                         |
| Offline messaging                   | **Pass**               | `/offline` copy.                                                                                                  |
| Small viewports / no hover-only nav | **Pass**               | Menu button + panel.                                                                                              |
| `aria-current` / nested routes      | **Pass**               | Single `current` on overview: **Overview** on `/dashboard`; **Deals** current on `/deals` and nested deal routes. |

### `docs/testing/pwa-web-client.md` (production-only items)

| Criterion                           | Result            | Notes                                                                      |
| ----------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `pnpm --filter @oompa/web build`    | **Pass**          | Run in CI / before release.                                                |
| DevTools Manifest / SW / Lighthouse | **Not run (MCP)** | Use production `next start` + Chrome DevTools.                             |
| Offline “not stale money as truth”  | **Partial**       | `/offline` copy OK; full test = disable network on prod build.             |
| `verify:pwa` + unit tests           | **Pass**          | `pnpm --filter @oompa/web verify:pwa` and `pnpm --filter @oompa/web test`. |

### API breaking points (curl smoke, historical)

| Request                                                           | Expected | Result (2026-04-06) |
| ----------------------------------------------------------------- | -------- | ------------------- |
| `GET /api/v1/deals` (no cookie)                                   | **401**  | **Pass**            |
| `GET /api/v1/health`                                              | **200**  | **Pass**            |
| `GET /api/v1/admin/ping` (no cookie)                              | **401**  | **Pass**            |
| `POST /api/v1/auth/login` body `{}`                               | **400**  | **Pass**            |
| `POST /api/v1/auth/login` wrong creds                             | **401**  | **Pass**            |
| `GET /api/v1/deals` (valid session)                               | **200**  | **Pass**            |
| `POST /api/v1/auth/logout` with `{}` via **Next `:3000`** rewrite | **204**  | **Pass**            |
| `GET /api/v1/deals` after logout                                  | **401**  | **Pass**            |

### Automated / API (historical)

| Area                   | Result   |
| ---------------------- | -------- | ------------------------------------------------------------------------------------ |
| `pnpm test` (monorepo) | **Pass** | Auth, deals, payments, coverage thresholds.                                          |
| Live API + browser     | **Pass** | Session, CRUD create (MCP), logout **204** + cookie cleared through `:3000` rewrite. |

### Follow-up (human, historical)

1. Production: `pnpm --filter @oompa/web build && pnpm --filter @oompa/web start` → finish `docs/testing/pwa-web-client.md` DevTools checklist (Manifest, SW, Lighthouse).
2. Real Chrome: full Tab order from skip link through every primary CTA; **confirm()** flows for delete payment / delete deal.
3. Invoice HTML: open **View invoice** in a real tab and verify auth cookie + HTML payload (MCP often does not follow `target=_blank`).
4. Optional DB cleanup: MCP smoke run may create a deal titled **MCP Smoke Deal 2026-04-06** — delete from the UI or DB if you do not want the fixture.
