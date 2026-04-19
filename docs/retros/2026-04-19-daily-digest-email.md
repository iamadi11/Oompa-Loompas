# Retro: Daily Email Digest

**Date:** 2026-04-19  
**Version:** v0.5.4

## What was built

Opt-out daily email digest (11:30 AM IST) listing overdue payments, payments due within 3 days, and deliverables due within 3 days — with formatted amounts and deep links. Settings page toggle + API endpoint. Resend-backed with graceful no-op when key absent.

## Decisions + why

- **Amounts in email (not in push):** Email is direct delivery; SOT §25.2 only restricts push payloads that flow through FCM/APNS. Including amounts makes the digest more actionable.
- **Opt-out default:** Transactional alert, not marketing. Creators who just registered should get this without extra friction. Opt-out at `/settings`.
- **No BullMQ yet:** `node-cron` already used for push notifications. Reusing it here defers the BullMQ migration to when queues are genuinely needed (multiple worker nodes, retries, dead-letter).
- **Per-user error isolation:** `Promise.all` with per-user try/catch — one bad DB query doesn't kill the entire job run.

## Critic feedback

The digest is only useful if it's timely and scannable. Amounts + brand name + days overdue / until due + single CTA per item achieves that. The opt-out is one click at `/settings` — low enough friction to keep engaged creators subscribed.

## Post-deploy baseline

- **Signal to read:** Resend dashboard delivery rate + open rate (if tracking enabled)
- **Hypothesis:** >40% of active creators open within 2h of send; overdue payment click-throughs increase by >15% week-over-week
- **Metric proxy (without Resend analytics):** Check if payment status transitions to RECEIVED cluster around 11:30–14:00 IST on days with overdue items

## What to watch

- Creators who unsubscribe after first send (indicates digest is noisy)
- Users with `emailDigestEnabled=true` but no items (no email sent — confirm in logs)
- Job duration as user count scales — switch to BullMQ if p99 > 30s

## What to do differently

- Vitest mock ordering with `Promise.all` is fragile when using `mockResolvedValueOnce` chains. Use `mockRejectedValue` (not `Once`) for total failure cases or restructure tests to be sequential.
- Prisma `Decimal` → `number` conversion (`r.amount.toNumber()`) must be matched in test mocks with `{ toNumber: () => value }` objects — document this pattern for future DB query tests.
