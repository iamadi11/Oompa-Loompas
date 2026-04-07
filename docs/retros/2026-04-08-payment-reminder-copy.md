# Retro: Payment reminder copy

Shipped: 2026-04-08

## What was built

Plain-text reminder generator in **`@oompa/utils`**, **Copy reminder** on deal payment rows and overdue payment cards, **`brandName`** on dashboard/attention overdue payment actions, and **absolute invoice URLs** for pasting.

## Decisions

- **Clipboard first** instead of email jobs — matches “simplest system” and existing infra.
- **Shared button component** to avoid duplicating clipboard + toast logic.

## What to watch

Whether creators hit **clipboard permission** issues on mobile PWA; whether **invoice URL** auth confuses brands.

## What we’d do differently

Add a **structured analytics event** in the same PR if product needs proof of adoption immediately.
