# Architecture: Main nav `aria-current`

## Module

Web shell only (`apps/web`). No API or shared types changes.

## Data flow

`usePathname()` (client) → `isMainNavCurrent(pathname, target)` (pure, unit-tested) → `aria-current` + conditional classes on `next/link` anchors.

## Data model

None.

## Operational design

Deploy with web app. Rollback: revert `layout.tsx` and remove `components/shell/MainNav.tsx` + `lib/main-nav.ts`.

## Tech choices

| Choice | Alternatives | Why |
|--------|--------------|-----|
| Client subcomponents in root layout | Middleware-injected `data-*` on `<body>` | `usePathname()` is idiomatic App Router |
| `next/link` | Raw `<a>` | Client navigation + prefetch; same a11y surface |
| Pure `isMainNavCurrent` in `lib/` | Inline in component | Testable without RTL; matches existing Vitest `lib/` coverage |
