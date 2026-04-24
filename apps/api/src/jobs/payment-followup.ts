import cron from 'node-cron'
import { prisma } from '@oompa/db'
import type { Currency } from '@oompa/types'
import { buildFollowupEmail, type FollowupEmailItem } from '@oompa/utils'
import { sendEmail, isEmailConfigured } from '../lib/email.js'

const ONE_DAY_MS = 24 * 60 * 60 * 1_000
const THRESHOLDS = [3, 7, 14] as const

type Threshold = 3 | 7 | 14

interface ThresholdPayment {
  id: string
  amount: { toNumber(): number }
  dueDate: Date | null
  dayThreshold: Threshold
  deal: { id: string; title: string; brandName: string; currency: string }
}

function thresholdWindow(threshold: Threshold, now: Date): { gte: Date; lte: Date } {
  const gte = new Date(now.getTime() - (threshold + 1) * ONE_DAY_MS)
  const lte = new Date(now.getTime() - threshold * ONE_DAY_MS)
  return { gte, lte }
}

async function getPaymentsAtThreshold(
  userId: string,
  threshold: Threshold,
  now: Date,
): Promise<ThresholdPayment[]> {
  const window = thresholdWindow(threshold, now)
  const rows = await prisma.payment.findMany({
    where: {
      deal: { userId },
      status: { in: ['PENDING', 'PARTIAL'] },
      dueDate: window,
      followupEmails: { none: { dayThreshold: threshold } },
    },
    include: { deal: { select: { id: true, title: true, brandName: true, currency: true } } },
  })
  return rows.map((r) => ({ ...r, dayThreshold: threshold }))
}

export async function runPaymentFollowupJob(now: Date = new Date()): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('[FOLLOWUP] RESEND_API_KEY not set — skipping')
    return
  }

  const webUrl = (process.env['WEB_URL'] ?? 'http://localhost:3000').replace(/\/$/, '')

  const users = await prisma.user.findMany({
    where: { followupEmailsEnabled: true },
    select: { id: true, email: true },
  })

  if (users.length === 0) {
    console.warn('[FOLLOWUP] No opted-in users — skipping')
    return
  }

  console.warn(`[FOLLOWUP] Checking ${users.length} user(s) for threshold crossings`)
  let sent = 0

  await Promise.all(
    users.map(async (user) => {
      try {
        const [p3, p7, p14] = await Promise.all(
          THRESHOLDS.map((t) => getPaymentsAtThreshold(user.id, t, now)),
        )
        const all = [...(p14 ?? []), ...(p7 ?? []), ...(p3 ?? [])]
        if (all.length === 0) return

        const items: FollowupEmailItem[] = all.map((p) => ({
          paymentId: p.id,
          dealId: p.deal.id,
          dealTitle: p.deal.title,
          brandName: p.deal.brandName,
          amount: p.amount.toNumber(),
          currency: p.deal.currency as Currency,
          dueDateIso: p.dueDate ? (p.dueDate.toISOString().split('T')[0] ?? null) : null,
          dayThreshold: p.dayThreshold,
        }))

        await prisma.paymentFollowupEmail.createMany({
          data: all.map((p) => ({ paymentId: p.id, dayThreshold: p.dayThreshold })),
          skipDuplicates: true,
        })

        const { subject, html, text } = buildFollowupEmail(items, webUrl)
        await sendEmail({ to: user.email, subject, html, text })

        sent++
      } catch (err) {
        console.error('[FOLLOWUP] Error for user', user.id, err)
      }
    }),
  )

  console.warn(`[FOLLOWUP] Done — sent to ${sent} user(s)`)
}

export function startPaymentFollowupCron(): void {
  // 07:30 UTC daily = 1:00 PM IST
  cron.schedule('30 7 * * *', () => {
    void runPaymentFollowupJob()
  })
  console.warn('[FOLLOWUP] Payment follow-up cron scheduled (07:30 UTC)')
}
