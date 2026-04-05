# Decision: Deals list document titles

Date: 2026-04-06  
Phase: 1 (Deal + Payment Intelligence)  
Status: APPROVED

## What

The **`/deals`** App Router segment sets **segment metadata** so the document title reflects the active view: **`Deals · Revenue`** by default and **`Needs attention · Revenue`** when `needsAttention=true` (or `1`), using the root `metadata.title.template`.

## Why now

Tabs and assistive tech expose **document title**. A generic site title on the deals list made orientation weaker than the **Deal filters** UI already provides. This is **low-cost risk reduction** (wrong-tab mistakes, SR context).

## Why not client-only `document.title`

Server **`generateMetadata`** stays aligned with the first paint and Next metadata pipeline; no hydration flash or SEO drift.

## Why not duplicate app name in segment titles

Root layout **`title.template`** already appends **`Revenue`**; segment titles must be **short labels only** (same pattern as deal detail metadata fix).

## User without this feature

Every deals tab reads **Creator Revenue Intelligence** until the user scans the page for **All deals** vs **Needs attention**.

## Success criteria

- `/deals` → title resolves to **`Deals · Revenue`**.
- `/deals?needsAttention=true` (and `needsAttention=1`) → **`Needs attention · Revenue`**.
- Filter flag parsing is **unit-tested** in `lib/deals-page.ts` (including `string | string[]` `searchParams`).

## Assumptions

- No other query shapes need to activate the needs-attention filter for title purposes beyond `true` / `1`.
