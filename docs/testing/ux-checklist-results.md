# UX / PWA checklist run log

Date: 2026-04-06 (updated after MCP + port reset)  
Environment: `pnpm --filter @oompa/api dev` + `pnpm --filter @oompa/web dev` after freeing ports 3000/3001; Cursor IDE Browser MCP.

## Cursor Browser MCP and the dev URL

| Check | Result | Notes |
|-------|--------|--------|
| `http://localhost:3000/` | **Flaky** | First attempt landed on `…/home` with Next 404 (likely history / client quirk). Prefer **`http://127.0.0.1:3000/`** for MCP. |
| `http://127.0.0.1:3000/` | **Pass** | Overview loaded; shell and CTAs in snapshot. |
| Public URL control (`https://example.com`) | **Pass** | Confirms MCP browser works when the host is reachable. |

**Tip:** If ports are busy, stop listeners on **3000** and **3001** (e.g. `lsof -ti tcp:3000 | xargs kill -9`) before starting API + web.

---

## MCP manual pass (CRUD + CTAs) — `http://127.0.0.1:3000`

All exercised in-browser unless noted.

| Flow | Result | Notes |
|------|--------|--------|
| Overview `/` | **Pass** | Summary cards, priority actions, recent deals, New deal link. |
| Deals list `/deals` | **Pass** | Filters All / Needs attention, Add deal, deal cards (direct `navigate`; client `Link` click from overview did not change URL in one attempt — use full navigation if automating). |
| New deal `/deals/new` | **Pass** | Title, brand, value, currency, notes, Create deal → redirect to detail. |
| Deal detail | **Pass** | Add payment (amount, due date), Add payment submit; Mark received; summary updates (Received / Outstanding). |
| Deliverable | **Pass** | + Add deliverable (after scroll-into-view — sticky header once intercepted click); title, platform, type, due date; Mark complete → Undo label; Delete deliverable (confirm). |
| Payment delete | **Pass** | Delete payment (confirm) → empty state. |
| Edit deal | **Pass** | Notes, Status → Active, Save changes. |
| Delete deal | **Pass** | Danger zone Delete (confirm) → `/deals`. |
| Attention `/attention` | **Pass** | Queue, links to deal / filtered deals. |
| Offline `/offline` | **Pass** | Copy states connection need; Try home link. |
| Skip link | **Present** | In tree on tested pages. |
| Duplicate `navigation` “Main” | **Fixed** | Mobile `<nav>` only mounts when the menu is open (`MainNav.tsx`) so closed state exposes a single desktop landmark. |

---

## `docs/ux/web-shell-pwa.md` (behavioral)

| Criterion | Result | Evidence |
|-----------|--------|------------|
| Restrained palette, type hierarchy | **Pass** | Observed on overview/deal pages; `tailwind` tokens. |
| Display + body fonts | **Pass** | Fraunces + Source Sans 3 in layout. |
| Reduced motion | **Pass (code)** | `globals.css` + component classes. |
| No purple-gradient cliché | **Pass** | Warm canvas + pine accent. |
| PWA tasks not blocked by install | **Pass** | No install gate. |
| Focus / keyboard | **Pass (partial MCP)** | Focus rings on controls; full tab audit in real Chrome still recommended. |
| Money paths network-backed | **Pass (code)** | `cache: 'no-store'` on server data fetches. |
| Offline messaging | **Pass** | `/offline` copy. |
| Small viewports / no hover-only nav | **Pass** | Menu button + panel pattern. |
| `aria-current` / Deals nested routes | **Pass** | Attention + Deals show `current` on correct routes. |

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
| `pnpm test` (monorepo) | **Pass** |
| Live API CRUD (`curl` :3001) | **Pass** |
| `getServerApiBaseUrl()` | **Pass** | SSR uses `API_URL` then `NEXT_PUBLIC_API_URL`. |

---

## Follow-up (human)

1. Production: `pnpm --filter @oompa/web build && pnpm --filter @oompa/web start` → finish `docs/testing/pwa-web-client.md` DevTools checklist (Manifest, SW, Lighthouse).  
2. Real Chrome: full Tab order from skip link through every primary CTA.  
3. Optional: investigate `next/link` client navigation not updating URL in MCP on first Deals click (workaround: `browser_navigate` to path).
