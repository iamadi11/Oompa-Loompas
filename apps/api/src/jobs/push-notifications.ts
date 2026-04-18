import cron from 'node-cron'
import { prisma } from '@oompa/db'
import webpush from 'web-push'
import type { PaymentStatus, DeliverableStatus } from '@oompa/types'

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1_000
const ONE_DAY_MS = 24 * 60 * 60 * 1_000

const NON_OVERDUE_PAYMENT_STATUSES: PaymentStatus[] = ['RECEIVED', 'REFUNDED']
const PENDING_DELIVERABLE_STATUS: DeliverableStatus = 'PENDING'

/** Maximum push notifications sent per user per cron run (SOT §25.2). */
export const MAX_NOTIFICATIONS_PER_USER = 3

export interface OverduePaymentItem {
  dealId: string
  brandName: string
  daysOverdue: number
}

export interface DueTodayDeliverableItem {
  dealId: string
  deliverableTitle: string
  brandName: string
}

export interface ScheduledReminderItem {
  paymentId: string
  dealId: string
  brandName: string
}

export interface UpcomingPaymentItem {
  dealId: string
  brandName: string
  daysUntilDue: number
}

export interface UpcomingDeliverableItem {
  dealId: string
  deliverableTitle: string
  brandName: string
  daysUntilDue: number
}

export interface PushNotificationPayload {
  title: string
  body: string
  url: string
}

export interface NotificationItems {
  overduePayments: OverduePaymentItem[]
  scheduledReminders: ScheduledReminderItem[]
  dueTodayDeliverables: DueTodayDeliverableItem[]
  upcomingPayments: UpcomingPaymentItem[]
  upcomingDeliverables: UpcomingDeliverableItem[]
}

function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function pluralDays(n: number): string {
  return n === 1 ? 'day' : 'days'
}

function daysUntilDueFrom(dueDate: Date, now: Date): number {
  const todayDay = Math.floor(now.getTime() / ONE_DAY_MS)
  const dueDay = Math.floor(dueDate.getTime() / ONE_DAY_MS)
  return dueDay - todayDay
}

/**
 * Pure: build ≤MAX_NOTIFICATIONS_PER_USER payloads from all item types.
 * Priority: overdue payments → scheduled reminders → due-today deliverables → upcoming payments → upcoming deliverables.
 * No amounts in payload per SOT §25.2 (privacy rule).
 */
export function buildNotificationPayloads(items: NotificationItems): PushNotificationPayload[] {
  const {
    overduePayments,
    scheduledReminders,
    dueTodayDeliverables,
    upcomingPayments,
    upcomingDeliverables,
  } = items
  const payloads: PushNotificationPayload[] = []

  for (const p of overduePayments) {
    if (payloads.length >= MAX_NOTIFICATIONS_PER_USER) break
    const d = p.daysOverdue
    payloads.push({
      title: 'Payment overdue',
      body: `${p.brandName} payment ${d} ${pluralDays(d)} overdue`,
      url: `/deals/${p.dealId}`,
    })
  }

  for (const r of scheduledReminders) {
    if (payloads.length >= MAX_NOTIFICATIONS_PER_USER) break
    payloads.push({
      title: 'Payment reminder',
      body: `${r.brandName} payment — time to send your follow-up`,
      url: `/deals/${r.dealId}`,
    })
  }

  for (const d of dueTodayDeliverables) {
    if (payloads.length >= MAX_NOTIFICATIONS_PER_USER) break
    payloads.push({
      title: 'Deliverable due today',
      body: `${d.deliverableTitle} due today for ${d.brandName}`,
      url: `/deals/${d.dealId}`,
    })
  }

  for (const p of upcomingPayments) {
    if (payloads.length >= MAX_NOTIFICATIONS_PER_USER) break
    const d = p.daysUntilDue
    const when = d === 0 ? 'due today' : `due in ${d} ${pluralDays(d)}`
    payloads.push({
      title: 'Payment due soon',
      body: `${p.brandName} payment ${when}`,
      url: `/deals/${p.dealId}`,
    })
  }

  for (const d of upcomingDeliverables) {
    if (payloads.length >= MAX_NOTIFICATIONS_PER_USER) break
    const n = d.daysUntilDue
    payloads.push({
      title: 'Deliverable due soon',
      body: `${d.deliverableTitle} due in ${n} ${pluralDays(n)} for ${d.brandName}`,
      url: `/deals/${d.dealId}`,
    })
  }

  return payloads
}

/** I/O: query overdue payments 3+ days past due for a user. Ordered oldest-first. */
async function getOverduePayments(userId: string, now: Date): Promise<OverduePaymentItem[]> {
  const threeDaysAgo = new Date(now.getTime() - THREE_DAYS_MS)

  const rows = await prisma.payment.findMany({
    where: {
      deal: { userId },
      dueDate: { lt: threeDaysAgo },
      status: { notIn: NON_OVERDUE_PAYMENT_STATUSES },
    },
    orderBy: { dueDate: 'asc' },
    take: MAX_NOTIFICATIONS_PER_USER,
    include: { deal: { select: { id: true, brandName: true } } },
  })

  return rows.map((r) => ({
    dealId: r.deal.id,
    brandName: r.deal.brandName,
    daysOverdue: Math.floor((now.getTime() - (r.dueDate?.getTime() ?? 0)) / ONE_DAY_MS),
  }))
}

/**
 * I/O: query payments with remindAt today. Clears remindAt immediately (one-shot semantics).
 * Skips already-received/refunded payments.
 */
async function getScheduledRemindersToday(
  userId: string,
  now: Date,
): Promise<ScheduledReminderItem[]> {
  const todayStart = startOfDay(now)
  const tomorrowStart = new Date(todayStart.getTime() + ONE_DAY_MS)

  const rows = await prisma.payment.findMany({
    where: {
      deal: { userId },
      remindAt: { gte: todayStart, lt: tomorrowStart },
      status: { notIn: NON_OVERDUE_PAYMENT_STATUSES },
    },
    take: MAX_NOTIFICATIONS_PER_USER,
    include: { deal: { select: { id: true, brandName: true } } },
  })

  if (rows.length > 0) {
    await prisma.payment.updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: { remindAt: null },
    })
  }

  return rows.map((r) => ({
    paymentId: r.id,
    dealId: r.deal.id,
    brandName: r.deal.brandName,
  }))
}

/** I/O: query deliverables due today (dueDate within today window) for a user. */
async function getDueTodayDeliverables(
  userId: string,
  now: Date,
): Promise<DueTodayDeliverableItem[]> {
  const todayStart = startOfDay(now)
  const tomorrowStart = new Date(todayStart.getTime() + ONE_DAY_MS)

  const rows = await prisma.deliverable.findMany({
    where: {
      deal: { userId },
      dueDate: { gte: todayStart, lt: tomorrowStart },
      status: PENDING_DELIVERABLE_STATUS,
    },
    take: MAX_NOTIFICATIONS_PER_USER,
    include: { deal: { select: { id: true, brandName: true } } },
  })

  return rows.map((r) => ({
    dealId: r.deal.id,
    deliverableTitle: r.title,
    brandName: r.deal.brandName,
  }))
}

/** I/O: query payments due within the next 3 days (not yet received). */
async function getUpcomingPayments(userId: string, now: Date): Promise<UpcomingPaymentItem[]> {
  const todayStart = startOfDay(now)
  const fourDaysFromNow = new Date(todayStart.getTime() + 4 * ONE_DAY_MS)

  const rows = await prisma.payment.findMany({
    where: {
      deal: { userId },
      dueDate: { gte: todayStart, lt: fourDaysFromNow },
      status: { notIn: NON_OVERDUE_PAYMENT_STATUSES },
    },
    orderBy: { dueDate: 'asc' },
    take: MAX_NOTIFICATIONS_PER_USER,
    include: { deal: { select: { id: true, brandName: true } } },
  })

  return rows.map((r) => ({
    dealId: r.deal.id,
    brandName: r.deal.brandName,
    daysUntilDue: daysUntilDueFrom(r.dueDate!, now),
  }))
}

/** I/O: query deliverables due in 1–3 days (tomorrow through 3 days — today covered by getDueTodayDeliverables). */
async function getUpcomingDeliverables(
  userId: string,
  now: Date,
): Promise<UpcomingDeliverableItem[]> {
  const todayStart = startOfDay(now)
  const tomorrowStart = new Date(todayStart.getTime() + ONE_DAY_MS)
  const fourDaysFromNow = new Date(todayStart.getTime() + 4 * ONE_DAY_MS)

  const rows = await prisma.deliverable.findMany({
    where: {
      deal: { userId },
      dueDate: { gte: tomorrowStart, lt: fourDaysFromNow },
      status: PENDING_DELIVERABLE_STATUS,
    },
    orderBy: { dueDate: 'asc' },
    take: MAX_NOTIFICATIONS_PER_USER,
    include: { deal: { select: { id: true, brandName: true } } },
  })

  return rows.map((r) => ({
    dealId: r.deal.id,
    deliverableTitle: r.title,
    brandName: r.deal.brandName,
    daysUntilDue: daysUntilDueFrom(r.dueDate!, now),
  }))
}

/** Send payload to all subscriptions for a user in parallel. Removes stale subscriptions (410/404). */
async function sendToUserSubscriptions(
  subs: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: PushNotificationPayload,
): Promise<void> {
  const json = JSON.stringify(payload)
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json,
        )
      } catch (err: unknown) {
        const httpErr = err as { statusCode?: number }
        if (httpErr.statusCode === 410 || httpErr.statusCode === 404) {
          console.warn('[CRON] Removing stale push subscription:', sub.endpoint)
          await prisma.pushSubscription.deleteMany({ where: { id: sub.id } })
        } else {
          console.error('[CRON] Push send error:', err)
        }
      }
    }),
  )
}

/**
 * Core daily push job. Exported for testability.
 * @param now - injectable for deterministic tests
 */
export async function runDailyPushJob(now: Date = new Date()): Promise<void> {
  console.warn('[CRON] Starting daily push notification job')

  const allSubs = await prisma.pushSubscription.findMany({
    select: { id: true, userId: true, endpoint: true, p256dh: true, auth: true },
  })

  if (allSubs.length === 0) {
    console.warn('[CRON] No push subscriptions — skipping')
    return
  }

  const subsByUser = new Map<string, typeof allSubs>()
  for (const sub of allSubs) {
    const existing = subsByUser.get(sub.userId) ?? []
    existing.push(sub)
    subsByUser.set(sub.userId, existing)
  }

  await Promise.all(
    [...subsByUser.entries()].map(async ([userId, subs]) => {
      try {
        const [overduePayments, scheduledReminders, dueTodayDeliverables, upcomingPayments, upcomingDeliverables] =
          await Promise.all([
            getOverduePayments(userId, now),
            getScheduledRemindersToday(userId, now),
            getDueTodayDeliverables(userId, now),
            getUpcomingPayments(userId, now),
            getUpcomingDeliverables(userId, now),
          ])

        const payloads = buildNotificationPayloads({
          overduePayments,
          scheduledReminders,
          dueTodayDeliverables,
          upcomingPayments,
          upcomingDeliverables,
        })
        for (const payload of payloads) {
          await sendToUserSubscriptions(subs, payload)
        }
      } catch (err: unknown) {
        console.error('[CRON] Error processing user:', userId, err)
      }
    }),
  )

  console.warn('[CRON] Daily push job complete')
}

export function startPushNotificationCron(): void {
  // 01:30 UTC daily = 07:00 IST
  cron.schedule('30 1 * * *', () => {
    void runDailyPushJob()
  })
  console.warn('[CRON] Push notification cron scheduled (01:30 UTC)')
}
