# Architecture: PWA Push Notifications — Payment Overdue Alerts

## Module
Notification (Phase 1.5) — cross-cutting: `@oompa/db`, `@oompa/api`, `@oompa/web`

## Data Flow
```
Creator opts in (web) → SW subscribes → POST /api/v1/push/subscribe → push_subscriptions table
                                                  ↓
                          Daily cron (07:00 IST) → query overdue payments/deliverables per user
                                                  ↓
                          web-push.sendNotification() → Browser Push Service → SW push event
                                                  ↓
                          SW shows notification → creator taps → opens /deals/:id
```

## Schema Changes + Migration

### New model: `PushSubscription`
```prisma
model PushSubscription {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint  String   @db.Text
  p256dh    String   @db.Text
  auth      String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([userId, endpoint])
  @@index([userId])
  @@map("push_subscriptions")
}
```

Migration: additive — no existing table/column changes. Forward-compatible, no rollback needed.

Retention policy: rows deleted via `onDelete: Cascade` when user deleted. No separate retention concern.

## API Contract

### New routes under `/api/v1/push` (auth required)
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/v1/push/public-key` | — | `{ data: { publicKey: string } }` |
| POST | `/api/v1/push/subscribe` | `{ endpoint, keys: { p256dh, auth } }` | `204` |
| DELETE | `/api/v1/push/unsubscribe` | `{ endpoint }` | `204` |

Push payload sent to browser (encrypted via VAPID):
```json
{ "title": "Payment overdue", "body": "BrandX payment 4 days overdue", "dealId": "uuid" }
```
No rupee amounts in payload per SOT §25.2.

## Notification Triggers (SOT §25.1)
| Trigger | Title | Body |
|---------|-------|------|
| Payment 3+ days overdue | "Payment overdue" | "[Brand] payment [N] days overdue" |
| Payment due in <24h | "Payment due tomorrow" | "[Brand] payment due tomorrow" |
| Deliverable due today | "Deliverable due today" | "[Title] due today for [Brand]" |

Max 3 notifications per user per cron run.

## Cron Job
- Location: `apps/api/src/jobs/push-notifications.ts` (job logic)
- Scheduled from: `apps/api/src/index.ts` (not `buildServer` — avoids test noise)
- Schedule: `30 1 * * *` (01:30 UTC = 07:00 IST)
- Package: `node-cron`
- Sends via `web-push` npm package

## Service Worker Changes
Add `push` + `notificationclick` handlers to `apps/web/app/sw.ts` **before** `serwist.addEventListeners()` so Serwist does not intercept them.

## Tech Choices
| Choice | Rationale |
|--------|-----------|
| `web-push` npm | Battle-tested VAPID implementation; no external push service |
| `node-cron` | Simple, no infrastructure; sufficient for Phase 1.5 single-process |
| VAPID over FCM/APNS | Browser-native, no vendor dependency, works on Android Chrome + iOS Safari 16.4+ |
| Endpoint-keyed subscriptions | Same user on multiple browsers each gets their own row |
| No `pushNotificationsEnabled` flag on User | Subscription row IS the opt-in state |

## Scale
- At 10K creators: 10K rows in `push_subscriptions`, daily cron reads all with subscriptions + overdue. One DB query (JOIN users → push_subscriptions → deals → payments). Acceptable at 10K; index on `userId` covers it.
- Web-push sends are sequential in Phase 1.5; parallelise with `Promise.allSettled` batching if needed at 1K+ users.

## Ops
- Deploy: standard; no infra changes beyond env vars
- Rollback: remove cron schedule + push routes; subscriptions table stays (no harm)
- Env vars required: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- VAPID keys generated once with `web-push generateVAPIDKeys` CLI; stored in `.env`
- Monitoring: cron logs `info` per send, `error` on failure (existing Fastify logger)
- RPO/RTO: no financial data; missed push = minor UX degradation, not data loss
