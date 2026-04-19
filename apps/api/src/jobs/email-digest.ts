import cron from 'node-cron'
import { prisma } from '@oompa/db'
import { formatCurrency } from '@oompa/utils'
import type { Currency, PaymentStatus, DeliverableStatus } from '@oompa/types'
import { sendEmail, isEmailConfigured } from '../lib/email.js'

const ONE_DAY_MS = 24 * 60 * 60 * 1_000

const NON_COLLECTABLE_STATUSES: PaymentStatus[] = ['RECEIVED', 'REFUNDED']
const PENDING_DELIVERABLE: DeliverableStatus = 'PENDING'

export interface OverduePaymentDigestItem {
  dealId: string
  brandName: string
  amount: number
  currency: Currency
  daysOverdue: number
}

export interface UpcomingPaymentDigestItem {
  dealId: string
  brandName: string
  amount: number
  currency: Currency
  daysUntilDue: number
}

export interface UpcomingDeliverableDigestItem {
  dealId: string
  deliverableTitle: string
  brandName: string
  daysUntilDue: number
}

export interface DigestItems {
  overduePayments: OverduePaymentDigestItem[]
  upcomingPayments: UpcomingPaymentDigestItem[]
  upcomingDeliverables: UpcomingDeliverableDigestItem[]
}

function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function daysUntilDueFrom(dueDate: Date, now: Date): number {
  const todayDay = Math.floor(now.getTime() / ONE_DAY_MS)
  const dueDay = Math.floor(dueDate.getTime() / ONE_DAY_MS)
  return dueDay - todayDay
}

function pluralDays(n: number): string {
  return n === 1 ? 'day' : 'days'
}

/** Query overdue payments with amounts for email digest (no per-user cap unlike push). */
export async function getOverduePaymentsForDigest(
  userId: string,
  now: Date,
): Promise<OverduePaymentDigestItem[]> {
  const rows = await prisma.payment.findMany({
    where: {
      deal: { userId },
      dueDate: { lt: now },
      status: { notIn: NON_COLLECTABLE_STATUSES },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
    include: { deal: { select: { id: true, brandName: true, currency: true } } },
  })

  return rows.map((r) => ({
    dealId: r.deal.id,
    brandName: r.deal.brandName,
    amount: r.amount.toNumber(),
    currency: r.deal.currency as Currency,
    daysOverdue: Math.floor((now.getTime() - (r.dueDate?.getTime() ?? 0)) / ONE_DAY_MS),
  }))
}

/** Query payments due within the next 3 days with amounts for email digest. */
export async function getUpcomingPaymentsForDigest(
  userId: string,
  now: Date,
): Promise<UpcomingPaymentDigestItem[]> {
  const todayStart = startOfDay(now)
  const fourDaysFromNow = new Date(todayStart.getTime() + 4 * ONE_DAY_MS)

  const rows = await prisma.payment.findMany({
    where: {
      deal: { userId },
      dueDate: { gte: todayStart, lt: fourDaysFromNow },
      status: { notIn: NON_COLLECTABLE_STATUSES },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
    include: { deal: { select: { id: true, brandName: true, currency: true } } },
  })

  return rows.map((r) => ({
    dealId: r.deal.id,
    brandName: r.deal.brandName,
    amount: r.amount.toNumber(),
    currency: r.deal.currency as Currency,
    daysUntilDue: daysUntilDueFrom(r.dueDate!, now),
  }))
}

/** Query deliverables due in the next 3 days for email digest. */
export async function getUpcomingDeliverablesForDigest(
  userId: string,
  now: Date,
): Promise<UpcomingDeliverableDigestItem[]> {
  const todayStart = startOfDay(now)
  const fourDaysFromNow = new Date(todayStart.getTime() + 4 * ONE_DAY_MS)

  const rows = await prisma.deliverable.findMany({
    where: {
      deal: { userId },
      dueDate: { gte: todayStart, lt: fourDaysFromNow },
      status: PENDING_DELIVERABLE,
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
    include: { deal: { select: { id: true, brandName: true } } },
  })

  return rows.map((r) => ({
    dealId: r.deal.id,
    deliverableTitle: r.title,
    brandName: r.deal.brandName,
    daysUntilDue: daysUntilDueFrom(r.dueDate!, now),
  }))
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Pure: build HTML + plain text digest email from items. */
export function buildDigestEmail(
  items: DigestItems,
  webUrl: string,
): { subject: string; html: string; text: string } {
  const { overduePayments, upcomingPayments, upcomingDeliverables } = items
  const overdueCount = overduePayments.length
  const settingsUrl = `${webUrl}/settings`

  // Subject
  const subject =
    overdueCount > 0
      ? `${overdueCount} overdue payment${overdueCount > 1 ? 's' : ''} — action needed`
      : `Upcoming payments & deliverables this week`

  // HTML sections
  const sections: string[] = []

  if (overduePayments.length > 0) {
    const rows = overduePayments
      .map((p) => {
        const url = `${webUrl}/deals/${p.dealId}`
        const amt = formatCurrency(p.amount, p.currency)
        const d = p.daysOverdue
        return `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ece6;">
            <b style="color:#1c1917;">${escapeHtml(p.brandName)}</b>
            <span style="color:#dc2626;font-weight:600;"> — ${escapeHtml(amt)}</span>
            <span style="color:#78716c;font-size:13px;"> overdue by ${d} ${pluralDays(d)}</span><br>
            <a href="${url}" style="color:#d97706;font-size:13px;text-decoration:none;">→ View deal</a>
          </td>
        </tr>`
      })
      .join('')

    sections.push(`
      <h2 style="color:#dc2626;font-size:16px;margin:24px 0 8px;">⚠️ Overdue payments</h2>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>`)
  }

  if (upcomingPayments.length > 0) {
    const rows = upcomingPayments
      .map((p) => {
        const url = `${webUrl}/deals/${p.dealId}`
        const amt = formatCurrency(p.amount, p.currency)
        const when = p.daysUntilDue === 0 ? 'due today' : `due in ${p.daysUntilDue} ${pluralDays(p.daysUntilDue)}`
        return `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ece6;">
            <b style="color:#1c1917;">${escapeHtml(p.brandName)}</b>
            <span style="color:#1c1917;"> — ${escapeHtml(amt)}</span>
            <span style="color:#78716c;font-size:13px;"> ${when}</span><br>
            <a href="${url}" style="color:#d97706;font-size:13px;text-decoration:none;">→ View deal</a>
          </td>
        </tr>`
      })
      .join('')

    sections.push(`
      <h2 style="color:#1c1917;font-size:16px;margin:24px 0 8px;">📅 Upcoming payments</h2>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>`)
  }

  if (upcomingDeliverables.length > 0) {
    const rows = upcomingDeliverables
      .map((d) => {
        const url = `${webUrl}/deals/${d.dealId}`
        const when = d.daysUntilDue === 0 ? 'due today' : `due in ${d.daysUntilDue} ${pluralDays(d.daysUntilDue)}`
        return `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ece6;">
            <b style="color:#1c1917;">${escapeHtml(d.deliverableTitle)}</b>
            <span style="color:#78716c;"> for ${escapeHtml(d.brandName)}</span>
            <span style="color:#78716c;font-size:13px;"> — ${when}</span><br>
            <a href="${url}" style="color:#d97706;font-size:13px;text-decoration:none;">→ View deal</a>
          </td>
        </tr>`
      })
      .join('')

    sections.push(`
      <h2 style="color:#1c1917;font-size:16px;margin:24px 0 8px;">🗓 Upcoming deliverables</h2>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>`)
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;border:1px solid #e7e5e4;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid #f0ece6;">
      <span style="font-size:20px;font-weight:700;color:#1c1917;">Oompa</span>
      <span style="font-size:14px;color:#78716c;margin-left:8px;">Daily digest</span>
    </div>
    <div style="padding:20px 28px;">
      ${sections.join('')}
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f0ece6;">
        <a href="${webUrl}/deals" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">View all deals →</a>
      </div>
    </div>
    <div style="padding:16px 28px;background:#fafaf9;border-top:1px solid #f0ece6;">
      <p style="margin:0;font-size:12px;color:#a8a29e;">
        You're receiving this because you have overdue or upcoming items in Oompa.<br>
        <a href="${settingsUrl}" style="color:#78716c;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`

  // Plain text
  const textParts: string[] = ['OOMPA — Daily Digest\n']

  if (overduePayments.length > 0) {
    textParts.push('\n⚠️ OVERDUE PAYMENTS')
    for (const p of overduePayments) {
      const amt = formatCurrency(p.amount, p.currency)
      textParts.push(
        `• ${p.brandName} — ${amt} overdue by ${p.daysOverdue} ${pluralDays(p.daysOverdue)}\n  ${webUrl}/deals/${p.dealId}`,
      )
    }
  }

  if (upcomingPayments.length > 0) {
    textParts.push('\n📅 UPCOMING PAYMENTS')
    for (const p of upcomingPayments) {
      const amt = formatCurrency(p.amount, p.currency)
      const when = p.daysUntilDue === 0 ? 'due today' : `due in ${p.daysUntilDue} ${pluralDays(p.daysUntilDue)}`
      textParts.push(`• ${p.brandName} — ${amt} ${when}\n  ${webUrl}/deals/${p.dealId}`)
    }
  }

  if (upcomingDeliverables.length > 0) {
    textParts.push('\n🗓 UPCOMING DELIVERABLES')
    for (const d of upcomingDeliverables) {
      const when =
        d.daysUntilDue === 0 ? 'due today' : `due in ${d.daysUntilDue} ${pluralDays(d.daysUntilDue)}`
      textParts.push(`• ${d.deliverableTitle} for ${d.brandName} — ${when}\n  ${webUrl}/deals/${d.dealId}`)
    }
  }

  textParts.push(`\nView all deals: ${webUrl}/deals`)
  textParts.push(`\nManage email preferences: ${settingsUrl}`)

  return { subject, html, text: textParts.join('\n') }
}

/** Core daily digest job. Exported for testability. */
export async function runDailyDigestJob(now: Date = new Date()): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('[CRON] Email digest: RESEND_API_KEY not set — skipping')
    return
  }

  const webUrl = (process.env['WEB_URL'] ?? 'http://localhost:3000').replace(/\/$/, '')

  console.warn('[CRON] Starting daily email digest job')

  const users = await prisma.user.findMany({
    where: { emailDigestEnabled: true },
    select: { id: true, email: true },
  })

  if (users.length === 0) {
    console.warn('[CRON] Email digest: no opted-in users — skipping')
    return
  }

  let sent = 0
  await Promise.all(
    users.map(async (user) => {
      try {
        const [overduePayments, upcomingPayments, upcomingDeliverables] = await Promise.all([
          getOverduePaymentsForDigest(user.id, now),
          getUpcomingPaymentsForDigest(user.id, now),
          getUpcomingDeliverablesForDigest(user.id, now),
        ])

        const total = overduePayments.length + upcomingPayments.length + upcomingDeliverables.length
        if (total === 0) return // nothing to report — skip this user

        const { subject, html, text } = buildDigestEmail(
          { overduePayments, upcomingPayments, upcomingDeliverables },
          webUrl,
        )

        await sendEmail({ to: user.email, subject, html, text })
        sent++
      } catch (err) {
        console.error('[CRON] Email digest error for user', user.id, err)
      }
    }),
  )

  console.warn(`[CRON] Daily email digest complete — sent to ${sent} user(s)`)
}

export function startEmailDigestCron(): void {
  // 06:00 UTC daily = 11:30 AM IST
  cron.schedule('0 6 * * *', () => {
    void runDailyDigestJob()
  })
  console.warn('[CRON] Email digest cron scheduled (06:00 UTC)')
}
