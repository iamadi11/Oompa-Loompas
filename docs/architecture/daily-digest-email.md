# Architecture: Daily Digest Email

## Module
Notification (API) + Settings (API + Web)

## Data Flow
```
node-cron 06:00 UTC
  → runDailyDigestJob(now)
    → prisma: SELECT users WHERE emailDigestEnabled = true
    → for each user:
        getDigestItems(userId, now) → { overduePayments, upcomingPayments, upcomingDeliverables }
        if items.total > 0:
          buildDigestHtml(items, userEmail, webUrl) → HTML string
          sendEmail({ to, subject, html, text })    [Resend API]
```

## Schema Change

```sql
-- Migration: 20260419120000_add_email_digest_enabled
ALTER TABLE users ADD COLUMN email_digest_enabled BOOLEAN NOT NULL DEFAULT TRUE;
```

Forward-compatible: all existing users default to `true` (opted-in).

## New Files

- `packages/db/prisma/migrations/20260419120000_add_email_digest_enabled/migration.sql`
- `apps/api/src/lib/email.ts` — Resend client, `sendEmail()`
- `apps/api/src/jobs/email-digest.ts` — queries, template, job, cron
- `apps/api/src/routes/settings/handlers.ts` — `GET/PATCH /api/v1/settings/notifications`
- `apps/api/src/routes/settings/index.ts` — Fastify route registration

## Changed Files

- `packages/db/prisma/schema.prisma` — add `emailDigestEnabled` to User
- `apps/api/src/index.ts` — register `startEmailDigestCron()`
- `apps/api/src/routes/index.ts` — register settings routes
- `apps/web/app/(workspace)/settings/page.tsx` — add email digest toggle
- `apps/web/lib/api.ts` — `getNotificationSettings()`, `updateNotificationSettings()`
- `apps/api/.env.example` — add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`

## API Contract

```
GET  /api/v1/settings/notifications
     → { emailDigestEnabled: boolean, pushEnabled: boolean }

PATCH /api/v1/settings/notifications
     body: { emailDigestEnabled?: boolean }
     → 204 No Content
```

Auth: session-required. Scoped to authenticated user.

## Environment Variables

| Variable | Required | Default | Description |
|---------|----------|---------|-------------|
| `RESEND_API_KEY` | No | — | If absent, email cron silently no-ops |
| `RESEND_FROM_EMAIL` | No | `noreply@oompa.app` | Sender address |
| `RESEND_FROM_NAME` | No | `Oompa` | Sender display name |

## Email Content

Subject: `{N} overdue payment{s} — {date}` (or "Upcoming payments this week" if no overdue)

Body sections:
1. Overdue payments (if any) — brand, amount, days overdue, deal link
2. Payments due in 3 days (if any) — brand, amount, days until due, deal link
3. Deliverables due in 3 days (if any) — title, brand, days until due, deal link
4. Footer — "View all deals" link + opt-out link to `/settings`

Amounts ARE included (unlike push payloads — email is direct delivery, not third-party infra).

## Scale / Performance

Single SQL per user (3 queries combined). At 10K creators: ≤10K Resend API calls/day.
Resend free tier: 3K/month → sufficient for early stage.
Pro tier: 50K/month ($20). No batching needed for Phase 2 scale.

## Rollback

Disable: remove `startEmailDigestCron()` from `index.ts`. Zero data impact.
Users retain `emailDigestEnabled` column value (harmless).
