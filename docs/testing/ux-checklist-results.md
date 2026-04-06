# UX / PWA checklist run log

Date: **2026-04-06** (auth + workspace routes; Cursor IDE Browser MCP on `http://127.0.0.1:3000`)

Environment: `pnpm --filter @oompa/api dev` + `pnpm --filter @oompa/web dev` (ports **3001** / **3000**). Prefer **`http://127.0.0.1:3000/`** for MCP (avoids odd history / client quirks vs `localhost`).

**Local DB:** Run `pnpm --filter @oompa/db exec prisma migrate deploy` against your `DATABASE_URL` before first auth test. Seed or sign-in user must exist (`SEED_ADMIN_*` when DB has no deals, or your own user).

---

## Cursor Browser MCP and the dev URL

| Check | Result | Notes |
|-------|--------|--------|
| `http://127.0.0.1:3000/` | **Pass** | Marketing landing; CTAs present. Logged-in session redirects to `/dashboard` (middleware). |
| `http://127.0.0.1:3000/login` | **Pass** | Email/password, Sign in, skip link, back link. |
| Client `Link` click vs `navigate` | **Partial** | Some MCP clicks on marketing **Log in** did not change URL; **full navigation** to `/login` is reliable for automation. |

**Tip:** If ports are busy: `lsof -ti tcp:3000 | xargs kill -9` (and **3001**) before restarting API + web.

---

## MCP manual pass (auth + CRUD + CTAs) — `http://127.0.0.1:3000`

| Flow | Result | Notes |
|------|--------|--------|
| Marketing `/` | **Pass** | Hero, outcome copy, Log in / Open workspace / How it works. |
| Login → session | **Pass** | POST via same-origin `/api/v1/...` rewrite; redirect to `/dashboard`. |
| Overview `/dashboard` | **Pass** | Summary cards, recent deals, New deal, View all; Admin + Log out when `ADMIN`. |
| Deals list `/deals` | **Pass** | All / Needs attention, Add deal, deal cards. |
| New deal `/deals/new` | **Pass** | Create → redirect to deal detail. |
| Deal detail — payment | **Pass** | Add payment; Mark received; summary updates (Received / Outstanding). |
| Deal detail — deliverable | **Pass** | Add deliverable (scroll-into-view if sticky header overlaps — mitigated with `scroll-padding-top` on `html`). |
| Payment delete | **Not run** | Pattern unchanged; `confirm()` non-blocking in MCP — use real Chrome for dialog UX. |
| Edit deal (valid status) | **Pass** | Notes save; **invalid** DRAFT→ACTIVE correctly rejected by API — UI now limits status dropdown to **allowed transitions**. |
| Delete deal | **Not run** | Same as confirm flows in MCP. |
| Attention `/attention` | **Pass** | Caught-up empty state; Back to overview → `/dashboard`. |
| Admin `/admin` | **Pass** | RBAC probe copy for `ADMIN`. |
| Offline `/offline` | **Pass** | Copy + Try home (`/`). |
| Log out | **Pass** (after fix) | **Bug fixed:** `clearCookie` must use same **path / httpOnly / secure / sameSite** as `setCookie`, or the session cookie persists and `/login` bounces back to `/dashboard`. |

---

## Engineering fixes from this run

| Item | Change |
|------|--------|
| Sticky header vs scroll targets | `apps/web/app/globals.css` — `scroll-padding-top: 5.5rem` on `html`. |
| Logout cookie not cleared | `apps/api/src/routes/auth/handlers.ts` — shared `sessionCookieBaseOptions()` for `setCookie` + `clearCookie`. |
| Impossible deal status in UI | `apps/web/components/deals/DealForm.tsx` — status `<Select>` options derived from `DEAL_STATUS_TRANSITIONS` in edit mode. |

---

## `docs/ux/web-shell-pwa.md` (behavioral)

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Restrained palette, type hierarchy | **Pass** | Observed on marketing + workspace pages. |
| Display + body fonts | **Pass** | Fraunces + Source Sans 3 (root layout). |
| Reduced motion | **Pass (code)** | `globals.css` + Tailwind `motion-reduce:*`. |
| No purple-gradient cliché | **Pass** | Warm canvas + brand accent. |
| PWA tasks not blocked by install | **Pass** | No install gate. |
| Focus / keyboard | **Pass (partial MCP)** | Focus rings on controls; full tab order in real Chrome still recommended. |
| Money paths network-backed | **Pass (code)** | `cache: 'no-store'` on server `serverApiFetch`; client API uses `credentials: 'include'`. |
| Offline messaging | **Pass** | `/offline` copy. |
| Small viewports / no hover-only nav | **Pass** | Menu button + panel. |
| `aria-current` / nested routes | **Pass** | Overview + Deals show `current` on expected routes (`/dashboard`, `/deals/...`). |

---

## `docs/testing/pwa-web-client.md` (production-only items)

| Criterion | Result | Notes |
|-----------|--------|--------|
| `pnpm --filter @oompa/web build` | **Pass** | Run in CI / before release. |
| DevTools Manifest / SW / Lighthouse | **Not run (MCP)** | Use production `next start` + Chrome DevTools. |
| Offline “not stale money as truth” | **Partial** | `/offline` copy OK; full test = disable network on prod build. |
| `verify:pwa` + unit tests | **Pass** | `pnpm --filter @oompa/web verify:pwa` and `pnpm --filter @oompa/web test`. |

---

## Automated / API

| Area | Result |
|------|--------|
| `pnpm test` (monorepo) | **Pass** (run after handler + DealForm changes) |
| Live API | **Pass** | Session + tenancy exercised via browser-driven flows. |

---

## Follow-up (human)

1. Production: `pnpm --filter @oompa/web build && pnpm --filter @oompa/web start` → finish `docs/testing/pwa-web-client.md` DevTools checklist (Manifest, SW, Lighthouse).  
2. Real Chrome: full Tab order from skip link through every primary CTA; **confirm()** flows for delete payment / delete deal.  
3. Invoice HTML: open **View invoice** in a real tab and verify auth cookie + HTML payload (MCP often does not follow `target=_blank`).
