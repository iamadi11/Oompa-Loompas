# UX / PWA checklist run log

Date: 2026-04-06  
Environment: local development (API verified on port 3001); Cursor IDE Browser MCP.

## Cursor Browser MCP vs `localhost`

| Check | Result | Notes |
|-------|--------|--------|
| Navigate to `http://localhost:3000` | **Blocked** | MCP browser stayed on `about:blank` (no route to host loopback from the tool sandbox). |
| Navigate to public URL (`https://example.com`) | **Pass** | Snapshot and refs work. |

**Implication:** Automated MCP pass/fail for shell/offline/install must be run in **your** Chrome DevTools against `pnpm --filter @oompa/web start` (production) per `docs/testing/pwa-web-client.md`, or use a tunnel URL the MCP browser can reach.

---

## `docs/ux/web-shell-pwa.md` (behavioral)

| Criterion | Result | Evidence |
|-----------|--------|------------|
| Restrained palette, type hierarchy, whitespace | **Pass (code review)** | `tailwind.config.ts` canvas/surface/brand; `font-display` on key headings. |
| Display + body fonts via `next/font` | **Pass** | `app/layout.tsx` — Fraunces + Source Sans 3. |
| Motion only for feedback; reduced motion respected | **Pass** | `globals.css` `prefers-reduced-motion`; components use `motion-reduce:transition-none`. |
| Avoid purple-gradient / generic dashboard cliché | **Pass** | Pine + warm neutrals; no purple gradients. |
| PWA: primary tasks not blocked by install | **Pass (by design)** | No install gate in app shell. |
| Visible focus + keyboard order in shell | **Pass (code review)** | Skip link, `focus-visible:ring-*`, mobile menu is button-driven not hover-only. |
| Money paths network-backed | **Pass (by design)** | Server `fetch` `cache: 'no-store'` on dashboard/deals/attention/deal detail. |
| Offline copy: connection required for deals/payments | **Pass** | `app/offline/page.tsx` states connection requirement. |
| Small viewports: one column; nav not hover-only | **Pass** | `AppShellHeader` hamburger + full-width links on small screens. |
| Global nav `aria-current` / Deals includes nested routes | **Pass** | `lib/main-nav.ts` + `MainNav.tsx` (Attention, Deals, Revenue home). |

---

## `docs/testing/pwa-web-client.md` (manual production)

| Criterion | Result | Notes |
|-----------|--------|--------|
| `pnpm --filter @oompa/web build` | **Pass** | Run in CI / locally before release. |
| Manifest fields in DevTools | **Not run (MCP)** | Requires local or staged HTTPS + DevTools. |
| SW registers in production only | **Not run (MCP)** | Confirmed by project PWA config (`next dev` disables SW). |
| Lighthouse PWA / installability | **Not run** | Needs stable URL. |
| Offline: explicit failure, not stale money data as truth | **Partial** | Copy reviewed; full verification needs production + network off in browser. |
| Tab order / focus visible | **Not run (MCP)** | Code reviewed; verify manually. |
| `pnpm --filter @oompa/web verify:pwa` | **Pass** | Run as part of release discipline. |
| `pnpm --filter @oompa/web test` | **Pass** | Includes manifest config + API client tests. |

---

## CRUD / CTAs (API + app wiring)

| Area | Result | Notes |
|------|--------|--------|
| Live API: deal create / patch / delete | **Pass** | Exercised via `curl` against `http://127.0.0.1:3001` (2026-04-06). |
| Live API: payment create / patch / delete | **Pass** | Same. |
| Live API: deliverable create / patch / delete | **Pass** | Same. |
| Monorepo tests | **Pass** | `pnpm test` — all packages green. |
| Server-side API base URL | **Fixed** | `getServerApiBaseUrl()` — `API_URL` with fallback to `NEXT_PUBLIC_API_URL` so SSR fetch matches client `api.ts` when only public env is set. |

---

## Follow-up (human, in real Chrome)

1. Production: `pnpm --filter @oompa/web build && pnpm --filter @oompa/web start` → complete §7.8 checklist in `docs/testing/pwa-web-client.md`.  
2. Tab through: header → skip link → main → all CTAs on overview, deals list, deal detail (forms, add payment/deliverable, delete).  
3. Confirm invoice link opens in new tab with correct API host when `NEXT_PUBLIC_API_URL` differs from localhost.
