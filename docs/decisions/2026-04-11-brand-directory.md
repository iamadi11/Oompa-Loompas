# Decision: Brand directory (CRM lite read)
Date: 2026-04-11
Phase: Phase 1 — Deal + Payment Intelligence
Status: APPROVED

## What
Extend **`GET /api/v1/deals/brands`** with **per-currency contracted totals**, add **`/deals/brands`** table UI, and wire **`?brandName=`** through the deals list (API already supported filter; web did not pass it). Pipeline and attention pills preserve the brand query.

## Why Now
Creators think in brands; seeing aggregate value and jumping to filtered deals reduces context switching before full CRM (contacts, notes) exists.

## Why Not email-to-deal first
Inbound email is higher build cost; directory is schema-free and reuses deal rows.

## Why Not a new `brands` table
Duplicates maintenance; aggregates from deals stay authoritative until profile entities ship.

## User Without This Feature
Scrolls the full deal list or exports CSV to infer brand exposure.

## Success Criteria
Multi-currency brands show separate totals (no bogus single-currency sum); filtered deal list matches API `brandName` contains rule; nav still highlights Deals on `/deals/brands`.

## Assumptions
`groupBy` on `(brandName, currency)` remains acceptable at Phase 1 scale.
