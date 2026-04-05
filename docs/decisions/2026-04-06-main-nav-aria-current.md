# Decision: Main nav `aria-current="page"`

Date: 2026-04-06  
Phase: 1 (Deal + Payment Intelligence)  
Status: APPROVED

## What

The global header **Main** navigation sets `aria-current="page"` on **Revenue** (home), **Attention**, and **Deals** when the active route matches, with visible emphasis (semibold + darker text) on the current item.

## Why now

Creators move between overview, attention queue, and deals constantly. Without a programmatic “you are here” indicator, screen-reader users and keyboard navigators lack the same orientation that **Deal filters** already provide on `/deals`. This reduces **operational risk** (wrong screen, missed follow-up) at near-zero cost.

## Why not rely on visual styling alone

WCAG 2.2 expects current location to be **programmatically determinable** where multiple navigation options exist; `aria-current` is the standard pattern.

## Why not a larger IA redesign

The three destinations are already correct; the gap is **semantics**, not information architecture.

## User without this feature

Tabbing through **Attention** and **Deals** sounds identical to being on another route; the user must infer location from page content only.

## Success criteria

- On `/`, **Revenue** has `aria-current="page"`; Attention and Deals do not.
- On `/attention`, **Attention** is current; nested `/attention/*` (if added) stays current.
- On `/deals`, `/deals/new`, and `/deals/[id]`, **Deals** is current.

## Assumptions

- No top-level route outside `/deals/*` should light up **Deals** (true today).
