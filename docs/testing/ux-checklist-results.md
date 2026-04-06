# UX / PWA checklist run log

Date: **2026-04-07** — **QA pass (Browser MCP, curl API matrix, monorepo verify, production build spot-check)**

**Environment:** API `http://127.0.0.1:3001`, web dev `http://127.0.0.1:3000` with `API_URL=http://127.0.0.1:3001`. [`apps/web/package.json`](../../apps/web/package.json) pins **`next dev -p 3000`** so a global `PORT` env variable cannot bind the web app to the API port. **Do not set `NEXT_PUBLIC_API_URL`** for normal local dev (same-origin session cookie on `:3000`).

**Production spot-check:** `pnpm --filter @oompa/web build` then `pnpm exec next start -p 3020` from `apps/web` — `GET /manifest.webmanifest` and `GET /serwist/sw.js` returned **200**.

### Engineering changes this pass

| Item | Change |
| ---- | ------ |
| Web dev port | [`apps/web/package.json`](../../apps/web/package.json) — `dev`: `next dev -p 3000` |
| Production build | `build`: `NODE_ENV=production next build` — avoids prerender/runtime errors when a parent shell sets a non-production `NODE_ENV` (e.g. `test`) |
| Login UX / automation | [`LoginForm.tsx`](../../apps/web/components/auth/LoginForm.tsx) — `role="form"` + `type="button"` submit (no native `<form method="post">` document POST to `/login`); controlled email/password state |

### Browser MCP vs [web-shell-pwa.md](../ux/web-shell-pwa.md)

| Check | Result | Notes |
| ----- | ------ | ----- |
| Marketing `/` — skip link, hero, CTAs | **Pass** | Skip to main content, Log in, Open your workspace, How it works; outcome copy |
| `/offline` — H1 + Try home | **Pass** | Title `Offline · Oompa` |
| `/login` — shell | **Pass** | Email, Password, Sign in, Back to product page |
| **Sign in** via MCP (fill + click) | **Partial** | No `POST /api/v1/auth/login` in MCP network log; **curl** session flow and **Vitest** [`LoginForm.test.tsx`](../../apps/web/components/auth/LoginForm.test.tsx) **Pass**. Confirm in **real Chrome**. |
| Auth gate `/deals` logged out | **Pass** | `http://127.0.0.1:3000/deals` → `/login?from=%2Fdeals` |
| Global 404 | **Pass** | Title `Page not found · Oompa`; MCP a11y on **dev** may show Next overlay controls (Show Details / Reload) — prefer `curl` or prod build for marketing copy only |

### API matrix (curl, `127.0.0.1:3001` and rewrite via `:3000`)

| Request | Expected | Result |
| ------- | -------- | ------ |
| `GET /api/v1/health` — `Cache-Control` | `public, max-age=5` | **Pass** |
| `GET /health` — `Cache-Control` | `public, max-age=5` | **Pass** |
| `GET /api/v1/deals` (no cookie) | 401 | **Pass** |
| `POST /api/v1/auth/login` `{}` | 400 | **Pass** |
| `POST /api/v1/auth/login` bad password | 401 | **Pass** |
| `POST /api/v1/auth/login` valid user | 200 + `Set-Cookie` | **Pass** |
| `GET /api/v1/deals` (with session) | 200 | **Pass** |
| `GET /api/v1/auth/me` | 200 | **Pass** |
| `GET /api/v1/admin/ping` (ADMIN session) | 200 | **Pass** |
| `GET /api/v1/dashboard` | 200 | **Pass** (path is `/api/v1/dashboard`, not `/dashboard/summary`) |
| `GET /api/v1/attention` | 200 | **Pass** |
| `POST /api/v1/auth/logout` `{}` | 204 | **Pass** |
| `GET /api/v1/deals` after logout | 401 | **Pass** |
| `GET /api/v1/health` via `:3000` rewrite | 200 | **Pass** |
| `GET /manifest.webmanifest` (`:3000` dev) | 200 | **Pass** |

### [docs/testing/pwa-web-client.md](./pwa-web-client.md) (production server)

| Check | Result | Notes |
| ----- | ------ | ----- |
| `pnpm --filter @oompa/web build` | **Pass** | After `NODE_ENV=production` in build script |
| `GET /manifest.webmanifest` (`next start`) | **Pass** | 200 on port 3020 |
| `GET /serwist/sw.js` | **Pass** | 200 |
| DevTools / Lighthouse / offline money-truth | **Not run** | Human follow-up in real Chrome |

### Automated

| Command | Result |
| ------- | ------ |
| `pnpm -r test` / `lint` / `typecheck` | **Pass** |
| `pnpm --filter @oompa/web verify:pwa` | **Pass** |

### Follow-up (human)

1. **Real Chrome:** Logged-in shell, deal CRUD, `confirm()` deletes, **View invoice** (`target=_blank`), full keyboard order from skip link.
2. **Shell env:** If `next start` warns about non-standard `NODE_ENV`, use a clean terminal or `unset NODE_ENV` before starting.
3. **Local login user:** Create or upsert your own dev user; do not rely on committed credentials.

---

Date: **2026-04-06** — **Earlier pass (Browser MCP + curl + `pnpm -r` test/lint/typecheck + login helper)**

**This pass (Browser MCP on `http://127.0.0.1:3000`, curl, automated verify)**

| Check | Result | Notes |
| ----- | ------ | ----- |
| Marketing `/` — skip link + hero + CTAs | **Pass** | MCP snapshot: Skip to main content, Log in, Open your workspace, How it works, outcome headline |
| `/offline` — H1 + Try home | **Pass** | Title `Offline · Oompa` |
| `/login` — shell (email, password, Sign in, back link) | **Pass** | Title `Log in · Oompa` |
| **Sign in** via MCP (type + submit) | **Partial** | No `POST /api/v1/auth/login` observed after fill + click; likely **dev hydration / automation** vs React 19 `useActionState` form actions (console may show extension or chunk noise). **Verify in real Chrome** with seeded user; **RTL** [`LoginForm.test.tsx`](../../apps/web/components/auth/LoginForm.test.tsx) covers action + `useFormStatus`. |
| Auth gate `/deals` logged out | **Pass** | Redirect to `/login?from=%2Fdeals` |
| Global 404 (unknown path) | **Pass** | Title `Page not found · Oompa`; `curl` body includes H1 “This page does not exist”, Home, Log in (MCP a11y tree can show dev overlay buttons — prefer `curl` or real browser for copy) |
| `GET :3001` / `:3000` `/api/v1/health` | **Pass** | 200 |
| `GET /api/v1/deals` no cookie (`:3001`) | **Pass** | 401 |
| `POST /api/v1/auth/login` `{}` via `:3000` rewrite | **Pass** | 400 |
| `GET /manifest.webmanifest` (`:3000`) | **Pass** | 200 |
| `pnpm -r` **test** / **lint** / **typecheck** | **Pass** | After [`post-login-destination`](../../apps/web/lib/post-login-destination.ts) + [`LoginForm`](../../apps/web/components/auth/LoginForm.tsx) |

---

Date: **2026-04-06** — **Earlier pass (Boneyard + perf + Browser MCP + curl + full `pnpm -r` verify)**

**Environment:** API `http://127.0.0.1:3001`, Web `http://127.0.0.1:3000` — `pnpm --filter @oompa/api dev` + `apps/web` with **`API_URL=http://127.0.0.1:3001`** (rewrites) and **`pnpm dev`** (default Next.js 16 / Turbopack; service worker registration off in dev — see [`apps/web/components/pwa/SerwistRegister.tsx`](../../apps/web/components/pwa/SerwistRegister.tsx)). **Do not set `NEXT_PUBLIC_API_URL` for normal local dev** — browser `fetch` must stay same-origin so the session cookie is for `:3000` (see [`README.md`](../../README.md), [`apps/web/lib/api.ts`](../../apps/web/lib/api.ts)).

**Auth fixture:** `dev-browser-test@local.test` password rotated for automation (DB `users` row). **Do not** commit secrets; use your own seed user locally.

### This pass (Boneyard, API perf, login hardening)

| Check | Result | Notes |
| ----- | ------ | ----- |
| Workspace route **`loading.tsx`** (boneyard) | **Pass (code + build)** | [`apps/web/bones/`](../../apps/web/bones/) + [`WorkspaceRouteSkeleton`](../../apps/web/components/boneyard/WorkspaceRouteSkeleton.tsx); registry via [`BonesRegistryMount`](../../apps/web/components/boneyard/BonesRegistryMount.tsx). Regenerate with **`pnpm build && pnpm start -p 3020`** then **`pnpm --filter @oompa/web bones:build`** (see [README](../../README.md)). |
| API **gzip/brotli** (`@fastify/compress`) | **Pass (code)** | [`apps/api/src/server.ts`](../../apps/api/src/server.ts) — clients sending `Accept-Encoding` get compressed JSON where negotiated. |
| Health **`Cache-Control: public, max-age=5`** | **Pass** | `GET /health` and `GET /api/v1/health` (curl — see API table). |
| Deal detail **duplicate fetch** | **Pass (code)** | [`React.cache`](https://react.dev/reference/react/cache) on deal loader in [`deals/[id]/page.tsx`](../../apps/web/app/(workspace)/deals/[id]/page.tsx) dedupes metadata + page. |
| **`pnpm -r` test / lint / typecheck** | **Pass** | |
| **`pnpm --filter @oompa/web` build** | **Pass** | Includes static `/boneyard-capture/*` (noindex) for future bone regeneration. |
| **`pnpm --filter @oompa/web verify:pwa`** | **Pass** | |

### Re-run after blank `/` fix (`useAllowEntranceMotion`) — historical

`useReducedMotion()` returns **`null`** until hydration; treating it as falsy forced `initial={{ opacity: 0 }}` on marketing and other motion surfaces, so `/` could appear empty. **Fix:** [`apps/web/lib/motion/use-prefers-motion.ts`](../../apps/web/lib/motion/use-prefers-motion.ts) — entrance motion only when `useReducedMotion() === false`. **`RecentDealRow`** had a half-migrated hook usage (TypeScript break); wired to `useAllowEntranceMotion` / `usePrefersReducedMotion` in [`RecentDealRow.tsx`](../../apps/web/components/dashboard/RecentDealRow.tsx).

| Check (MCP snapshot, same env)              | Result   | Notes                                                                 |
| ----------------------------------------- | -------- | --------------------------------------------------------------------- |
| Marketing `/` — visible hero + copy       | **Pass** | H1 "Know what to collect…", tagline, region "Outcome-first", list items |
| Global **404** (unknown path)             | **Pass** | Title "Page not found · Oompa"; H1 "This page does not exist"; Home, Log in |
| `/offline`, `/login`, `manifest.webmanifest` | **Pass** | Same as table below (curl + prior MCP)                                |
| `pnpm -r` test / lint / build             | **Pass** | After `RecentDealRow` fix                                             |
| `pnpm --filter @oompa/web verify:pwa`     | **Pass** |                                                                       |

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
| **Sign in** via MCP (fill + click) | **Partial**    | [`LoginForm`](../../apps/web/components/auth/LoginForm.tsx) uses React 19 **`useActionState`** + **`useFormStatus`** (`react-dom`) and same-origin `api.login`. MCP did not observe `POST /api/v1/auth/login` in this run — treat as **tooling/hydration** limitation; use **real Chrome** + seeded user and **Vitest** for the form. **`curl -X POST http://127.0.0.1:3000/api/v1/auth/login`** for API smoke. Prefer **`browser_navigate`** → snapshot → type/fill → click. **Do not use `browser_lock`** before MCP unless required. |
| Protected deal URL logged out    | **Pass**           | `/deals/00000000-…` → `proxy` → `/login?from=…` (auth gate)                                                                                                                                                                                                                                   |
| `next/link` client nav in MCP    | **Partial**        | Per prior runs: prefer **`browser_navigate`** for route changes                                                                                                                                                                                                                               |

---

## Engineering fixes from this pass

| Item                                 | Change                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Boneyard skeletons** | [boneyard-js](https://github.com/0xGF/boneyard) capture routes under `/boneyard-capture/*`, workspace [`loading.tsx`](../../apps/web/app/(workspace)/dashboard/loading.tsx) files, [`bones/`](../../apps/web/bones/) artifacts, [`boneyard.config.json`](../../apps/web/boneyard.config.json) breakpoints. |
| **Login form actions** | React 19 **`useActionState`** + **`useFormStatus`**; shared [`postLoginDestination`](../../apps/web/lib/post-login-destination.ts) for safe `?from=` redirects. [`LoginForm.tsx`](../../apps/web/components/auth/LoginForm.tsx). |
| **API compression + health cache** | [`@fastify/compress`](../../apps/api/src/server.ts); `Cache-Control` on [`/health`](../../apps/api/src/server.ts) and [`/api/v1/health`](../../apps/api/src/routes/health/index.ts). |
| **PWA + default Next 16** | [`@serwist/turbopack`](../../apps/web/next.config.mjs) — **`next dev`** / **`next build`** without `--webpack`; SW at **`/serwist/sw.js`**, registration disabled in dev via [`SerwistRegister`](../../apps/web/components/pwa/SerwistRegister.tsx).                                                                                                                                                                                                 |
| **Login form fields**     | Named inputs + **`FormData`** in the action (no credential query params). See [`LoginForm.tsx`](../../apps/web/components/auth/LoginForm.tsx).                                                                                                                                                         |
| **Session cookie vs `NEXT_PUBLIC_API_URL`** | Browser `fetch` to `:3001` does not store session for `:3000`. [`lib/api.ts`](../../apps/web/lib/api.ts) — **`getBrowserApiBase()` returns `''` in `window`** (always same-origin `/api/v1/*`). README dev example: **`API_URL` only**.                                                                                                                        |
| **Login `useSearchParams` suspend**  | Server [`app/login/page.tsx`](../../apps/web/app/login/page.tsx) passes **`redirectFrom`** from `searchParams`; client [`LoginForm`](../../apps/web/components/auth/LoginForm.tsx) no longer calls `useSearchParams` (avoids hydration/tooling gaps).                                                                                                          |
| **`middleware` → `proxy` (Next 16)** | [`proxy.ts`](../../apps/web/proxy.ts) replaces deprecated `middleware.ts`; build warning removed.                                                                                                                                                                                                                                                            |
| **`browser_lock` + MCP**             | Lock overlay blocked automated clicks; run MCP **unlocked** unless user needs control handoff.                                                                                                                                                                                                                                                                |
| **`RecentDealRow` TypeScript**        | Incomplete motion hook migration → `useAllowEntranceMotion` + `usePrefersReducedMotion` (see [`RecentDealRow.tsx`](../../apps/web/components/dashboard/RecentDealRow.tsx)).                                                                                                                                                                                    |

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
| `GET /api/v1/health` response header                         | `Cache-Control: public, max-age=5` | **Pass** (curl `-D -`)                    |
| `GET /health` response header                                | `Cache-Control: public, max-age=5` | **Pass**                                    |
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
3. **Boneyard:** After changing workspace layout or [`fixtures/`](../../apps/web/components/boneyard/fixtures/), re-run **`bones:build`** against a **production** `next start` server (see [README](../../README.md)).
4. **MCP:** Use **`browser_navigate`** between flows; login **Partial** above — confirm with real browser + curl.

---

## Earlier log (2026-04-06 — auth + CRUD MCP, pre–Next 16 webpack dev fix)

Environment: `pnpm --filter @oompa/api dev` + `pnpm --filter @oompa/web dev` (ports **3001** / **3000**). Prefer **`http://127.0.0.1:3000/`** for MCP (avoids odd history / client quirks vs `localhost`).

**Local DB:** Run `pnpm --filter @oompa/db exec prisma migrate deploy` with `DATABASE_URL` set (e.g. from `apps/api/.env`) before first auth test. Use a real user for login (seed with `SEED_ADMIN_*` when the DB has no deals, or upsert a dev user).

### Cursor Browser MCP and the dev URL

| Check                             | Result      | Notes                                                                                                                   |
| --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `http://127.0.0.1:3000/`          | **Pass**    | Logged-out: marketing landing + CTAs. Logged-in: `proxy` redirects to `/dashboard`.                                     |
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
| Logout navigation / proxy       | `apps/web/components/shell/ShellAuthActions.tsx` — `window.location.assign('/login')` after logout.                           |
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
