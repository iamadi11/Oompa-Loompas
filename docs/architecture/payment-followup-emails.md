# Architecture: Automated Payment Follow-up Emails

## Module
Payment (extends Notification module)

## Data Flow
Daily cron → find threshold-crossing PENDING payments → group by user → build HTML email → Resend → record sent

## Schema Changes

### `users` table
New column: `followup_emails_enabled BOOLEAN DEFAULT TRUE`
Migration: `20260425120000_add_followup_emails_enabled`
Opt-out model (matches `email_digest_enabled` pattern).

### New table: `payment_followup_emails`
```sql
CREATE TABLE payment_followup_emails (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id    UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  day_threshold INT NOT NULL,            -- 3, 7, or 14
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payment_id, day_threshold)
);
CREATE INDEX idx_followup_emails_payment ON payment_followup_emails(payment_id);
```

Purpose: dedup guard — each (paymentId, dayThreshold) sent exactly once.

## Prisma Models

```prisma
// User — new field
followupEmailsEnabled Boolean @default(true) @map("followup_emails_enabled")

// Payment — new relation
followupEmails PaymentFollowupEmail[]

// New model
model PaymentFollowupEmail {
  id           String   @id @default(uuid())
  paymentId    String   @map("payment_id")
  payment      Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  dayThreshold Int      @map("day_threshold")
  sentAt       DateTime @default(now()) @map("sent_at")

  @@unique([paymentId, dayThreshold])
  @@index([paymentId])
  @@map("payment_followup_emails")
}
```

## API Contract

`GET /api/v1/settings/notifications` — extended response:
```json
{ "data": { "emailDigestEnabled": true, "pushEnabled": false, "followupEmailsEnabled": true } }
```

`PATCH /api/v1/settings/notifications` — extended body:
```json
{ "followupEmailsEnabled": false }
```

No new routes. Settings endpoint extended additively (backward compatible).

## Cron Job: `payment-followup.ts`

Schedule: `30 7 * * *` (07:30 UTC = 1:00 PM IST)
Why: separate window from digest (06:00 UTC) + push (01:30 UTC); mid-day when creator active.

**Thresholds:** 3 days, 7 days, 14 days

**Query per threshold `D`:**
```ts
prisma.payment.findMany({
  where: {
    deal: { user: { followupEmailsEnabled: true } },
    status: { in: ['PENDING', 'PARTIAL'] },
    dueDate: { gte: startOfDay(D+1 days ago), lte: endOfDay(D days ago) },
    followupEmails: { none: { dayThreshold: D } },
  },
  include: { deal: { include: { user: { select: { email, id } } } } },
})
```

3 parallel queries (one per threshold) → merge → group by userId → one email per user.

**Email per user:** one email, all threshold-crossing payments, sorted dayThreshold DESC (most overdue first).

**After send:** `prisma.paymentFollowupEmail.createMany({ data: [...] })`

## Email Templates

| Threshold | Subject | Urgency label |
|-----------|---------|---------------|
| 3 days | "Follow up: [N] payment(s) overdue" | "3 days overdue" |
| 7 days | "Urgent: [Brand] payment is 1 week overdue" | "1 week overdue" |
| 14 days | "Action needed: payment 2 weeks overdue" | "2 weeks overdue — escalate" |

Subject uses most urgent threshold in batch (14d > 7d > 3d).

Body: HTML (inline-CSS, same as digest):
- Per-payment row: brand, deal title, amount+currency, threshold label, pre-composed reminder in quote block
- "View on Oompa" CTA → `/attention`
- "Manage email preferences" footer → `/settings`

## Scale
10K creators × ~5 overdue payments = ~50K rows across 3 threshold queries.
Indexed on `dueDate` + `status` (existing) + `payment_followup_emails.payment_id` (new).
Once daily off-peak — acceptable.

## Cron Registration
In `apps/api/src/server.ts`:
```ts
startPaymentFollowupCron()
```

## Rollback
- Migration additive (new col default true, new table)
- Rollback: drop `payment_followup_emails`, drop `followup_emails_enabled`
- No data loss (no existing data depends on new fields)

## Ops
Monitor: log `[FOLLOWUP]` prefix; count emails per run. Alert if cron stops.
Rollout: no feature flag needed (opt-out, safe default).