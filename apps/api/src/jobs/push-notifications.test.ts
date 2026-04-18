import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  buildNotificationPayloads,
  runDailyPushJob,
  MAX_NOTIFICATIONS_PER_USER,
  type OverduePaymentItem,
  type DueTodayDeliverableItem,
  type UpcomingPaymentItem,
  type UpcomingDeliverableItem,
} from './push-notifications.js'
import { prisma } from '@oompa/db'
import webpush from 'web-push'

vi.mock('web-push', () => ({
  default: {
    sendNotification: vi.fn(),
    setVapidDetails: vi.fn(),
  },
}))

const mockPrisma = prisma as typeof prisma & {
  pushSubscription: {
    findMany: ReturnType<typeof vi.fn>
    deleteMany: ReturnType<typeof vi.fn>
  }
  payment: {
    findMany: ReturnType<typeof vi.fn>
  }
  deliverable: {
    findMany: ReturnType<typeof vi.fn>
  }
}

const NOW = new Date('2026-04-11T07:00:00.000Z')
const FOUR_DAYS_AGO = new Date(NOW.getTime() - 4 * 24 * 60 * 60 * 1_000)
const TWO_DAYS_FROM_NOW = new Date(NOW.getTime() + 2 * 24 * 60 * 60 * 1_000)

const SUB_1 = {
  id: 'sub-1',
  userId: 'user-1',
  endpoint: 'https://fcm.example.com/endpoint-1',
  p256dh: 'p256dh-1',
  auth: 'auth-1',
}

// ──────────────────────────────────────────────
// Pure: buildNotificationPayloads
// ──────────────────────────────────────────────

describe('buildNotificationPayloads', () => {
  it('returns empty array when no overdue items', () => {
    expect(buildNotificationPayloads([], [], [], [])).toEqual([])
  })

  it('builds overdue payment notification with correct copy', () => {
    const payments: OverduePaymentItem[] = [{ dealId: 'd1', brandName: 'Acme', daysOverdue: 4 }]
    const payloads = buildNotificationPayloads(payments, [], [], [])
    expect(payloads).toHaveLength(1)
    expect(payloads[0]?.title).toBe('Payment overdue')
    expect(payloads[0]?.body).toBe('Acme payment 4 days overdue')
    expect(payloads[0]?.url).toBe('/deals/d1')
  })

  it('uses singular "day" when daysOverdue is 1', () => {
    const payments: OverduePaymentItem[] = [{ dealId: 'd1', brandName: 'Brand', daysOverdue: 1 }]
    const payloads = buildNotificationPayloads(payments, [], [], [])
    expect(payloads[0]?.body).toBe('Brand payment 1 day overdue')
  })

  it('builds due-today deliverable notification with correct copy', () => {
    const deliverables: DueTodayDeliverableItem[] = [
      { dealId: 'd2', deliverableTitle: 'Reel', brandName: 'SomeBrand' },
    ]
    const payloads = buildNotificationPayloads([], deliverables, [], [])
    expect(payloads).toHaveLength(1)
    expect(payloads[0]?.title).toBe('Deliverable due today')
    expect(payloads[0]?.body).toBe('Reel due today for SomeBrand')
    expect(payloads[0]?.url).toBe('/deals/d2')
  })

  it('caps at MAX_NOTIFICATIONS_PER_USER across combined items', () => {
    const payments: OverduePaymentItem[] = Array.from({ length: 5 }, (_, i) => ({
      dealId: `d${i}`,
      brandName: `Brand${i}`,
      daysOverdue: 4,
    }))
    const payloads = buildNotificationPayloads(payments, [], [], [])
    expect(payloads).toHaveLength(MAX_NOTIFICATIONS_PER_USER)
  })

  it('fills remaining slots with deliverables after payments cap is not full', () => {
    const payments: OverduePaymentItem[] = [{ dealId: 'd1', brandName: 'Brand', daysOverdue: 5 }]
    const deliverables: DueTodayDeliverableItem[] = [
      { dealId: 'd2', deliverableTitle: 'Video', brandName: 'Brand2' },
      { dealId: 'd3', deliverableTitle: 'Post', brandName: 'Brand3' },
    ]
    const payloads = buildNotificationPayloads(payments, deliverables, [], [])
    expect(payloads).toHaveLength(3)
    expect(payloads[0]?.title).toBe('Payment overdue')
    expect(payloads[1]?.title).toBe('Deliverable due today')
    expect(payloads[2]?.title).toBe('Deliverable due today')
  })

  it('no payment amounts in body (SOT §25.2 privacy)', () => {
    const payments: OverduePaymentItem[] = [{ dealId: 'd1', brandName: 'Acme', daysOverdue: 4 }]
    const payloads = buildNotificationPayloads(payments, [], [], [])
    // Body must not contain currency symbols or numbers that look like amounts
    expect(payloads[0]?.body).not.toMatch(/₹|USD|\d{3,}/)
  })

  // ── upcoming payment notifications ──

  it('builds upcoming payment notification with correct copy (2 days)', () => {
    const upcoming: UpcomingPaymentItem[] = [
      { dealId: 'd5', brandName: 'NikeBrand', daysUntilDue: 2 },
    ]
    const payloads = buildNotificationPayloads([], [], upcoming, [])
    expect(payloads).toHaveLength(1)
    expect(payloads[0]?.title).toBe('Payment due soon')
    expect(payloads[0]?.body).toBe('NikeBrand payment due in 2 days')
    expect(payloads[0]?.url).toBe('/deals/d5')
  })

  it('uses singular "day" when daysUntilDue is 1 for upcoming payment', () => {
    const upcoming: UpcomingPaymentItem[] = [
      { dealId: 'd6', brandName: 'Puma', daysUntilDue: 1 },
    ]
    const payloads = buildNotificationPayloads([], [], upcoming, [])
    expect(payloads[0]?.body).toBe('Puma payment due in 1 day')
  })

  it('upcoming payment with daysUntilDue=0 shows "due today"', () => {
    const upcoming: UpcomingPaymentItem[] = [
      { dealId: 'd7', brandName: 'Reebok', daysUntilDue: 0 },
    ]
    const payloads = buildNotificationPayloads([], [], upcoming, [])
    expect(payloads[0]?.body).toBe('Reebok payment due today')
  })

  it('builds upcoming deliverable notification with correct copy', () => {
    const upcoming: UpcomingDeliverableItem[] = [
      { dealId: 'd8', deliverableTitle: 'YouTube Video', brandName: 'Sony', daysUntilDue: 3 },
    ]
    const payloads = buildNotificationPayloads([], [], [], upcoming)
    expect(payloads).toHaveLength(1)
    expect(payloads[0]?.title).toBe('Deliverable due soon')
    expect(payloads[0]?.body).toBe('YouTube Video due in 3 days for Sony')
    expect(payloads[0]?.url).toBe('/deals/d8')
  })

  it('priority order: overdue payments first, then due-today, then upcoming payments, then upcoming deliverables', () => {
    const overduePayments: OverduePaymentItem[] = [
      { dealId: 'd1', brandName: 'A', daysOverdue: 5 },
    ]
    const dueTodayDeliverables: DueTodayDeliverableItem[] = [
      { dealId: 'd2', deliverableTitle: 'Reel', brandName: 'B' },
    ]
    const upcomingPayments: UpcomingPaymentItem[] = [
      { dealId: 'd3', brandName: 'C', daysUntilDue: 2 },
    ]
    const upcomingDeliverables: UpcomingDeliverableItem[] = [
      { dealId: 'd4', deliverableTitle: 'Post', brandName: 'D', daysUntilDue: 3 },
    ]
    // cap=3 → overdue, dueToday, upcomingPayment (upcomingDeliverable dropped)
    const payloads = buildNotificationPayloads(
      overduePayments,
      dueTodayDeliverables,
      upcomingPayments,
      upcomingDeliverables,
    )
    expect(payloads).toHaveLength(3)
    expect(payloads[0]?.title).toBe('Payment overdue')
    expect(payloads[1]?.title).toBe('Deliverable due today')
    expect(payloads[2]?.title).toBe('Payment due soon')
  })

  it('upcoming items do not contain amounts (SOT §25.2)', () => {
    const upcoming: UpcomingPaymentItem[] = [
      { dealId: 'd1', brandName: 'Acme', daysUntilDue: 2 },
    ]
    const payloads = buildNotificationPayloads([], [], upcoming, [])
    expect(payloads[0]?.body).not.toMatch(/₹|USD|\d{3,}/)
  })
})

// ──────────────────────────────────────────────
// I/O: runDailyPushJob
// ──────────────────────────────────────────────

describe('runDailyPushJob', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips when no push subscriptions exist', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([])
    await runDailyPushJob(NOW)
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })

  it('sends notification for user with 3+ day overdue payment', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1])
    mockPrisma.payment.findMany.mockResolvedValueOnce([
      {
        id: 'pay-1',
        dueDate: FOUR_DAYS_AGO,
        status: 'PENDING',
        deal: { id: 'd1', brandName: 'Acme Corp' },
      },
    ])
    // upcoming payments
    mockPrisma.payment.findMany.mockResolvedValueOnce([])
    mockPrisma.deliverable.findMany.mockResolvedValue([])

    await runDailyPushJob(NOW)

    expect(webpush.sendNotification).toHaveBeenCalledOnce()
    const call = (webpush.sendNotification as ReturnType<typeof vi.fn>).mock.calls[0] as [
      unknown,
      string,
    ]
    const [sub, payloadStr] = call
    expect(sub).toMatchObject({ endpoint: SUB_1.endpoint })
    const payload = JSON.parse(payloadStr) as { title: string; body: string; url: string }
    expect(payload.title).toBe('Payment overdue')
    expect(payload.body).toContain('Acme Corp')
    expect(payload.url).toBe('/deals/d1')
  })

  it('sends due-today deliverable notification when no overdue payments', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1])
    mockPrisma.payment.findMany.mockResolvedValue([])
    mockPrisma.deliverable.findMany
      .mockResolvedValueOnce([
        {
          id: 'del-1',
          title: 'Instagram Reel',
          status: 'PENDING',
          dueDate: NOW,
          deal: { id: 'd2', brandName: 'BrandX' },
        },
      ])
      // upcoming deliverables
      .mockResolvedValueOnce([])

    await runDailyPushJob(NOW)

    expect(webpush.sendNotification).toHaveBeenCalledOnce()
    const payloadStr = (webpush.sendNotification as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[1] as string
    const payload = JSON.parse(payloadStr) as { title: string; body: string }
    expect(payload.title).toBe('Deliverable due today')
    expect(payload.body).toContain('BrandX')
  })

  it('sends upcoming payment notification when payment due in 2 days', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1])
    // overdue payments → empty
    mockPrisma.payment.findMany
      .mockResolvedValueOnce([])
      // upcoming payments
      .mockResolvedValueOnce([
        {
          id: 'pay-2',
          dueDate: TWO_DAYS_FROM_NOW,
          status: 'PENDING',
          deal: { id: 'd3', brandName: 'FutureBrand' },
        },
      ])
    mockPrisma.deliverable.findMany.mockResolvedValue([])

    await runDailyPushJob(NOW)

    expect(webpush.sendNotification).toHaveBeenCalledOnce()
    const payloadStr = (webpush.sendNotification as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[1] as string
    const payload = JSON.parse(payloadStr) as { title: string; body: string }
    expect(payload.title).toBe('Payment due soon')
    expect(payload.body).toContain('FutureBrand')
    expect(payload.body).toContain('2 days')
  })

  it('sends upcoming deliverable notification when deliverable due in 3 days', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1])
    mockPrisma.payment.findMany.mockResolvedValue([])
    // due-today deliverables → empty
    mockPrisma.deliverable.findMany
      .mockResolvedValueOnce([])
      // upcoming deliverables
      .mockResolvedValueOnce([
        {
          id: 'del-3',
          title: 'YouTube Integration',
          status: 'PENDING',
          dueDate: new Date(NOW.getTime() + 3 * 24 * 60 * 60 * 1_000),
          deal: { id: 'd4', brandName: 'TechCorp' },
        },
      ])

    await runDailyPushJob(NOW)

    expect(webpush.sendNotification).toHaveBeenCalledOnce()
    const payloadStr = (webpush.sendNotification as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[1] as string
    const payload = JSON.parse(payloadStr) as { title: string; body: string }
    expect(payload.title).toBe('Deliverable due soon')
    expect(payload.body).toContain('TechCorp')
  })

  it('skips user when no overdue or upcoming items', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1])
    mockPrisma.payment.findMany.mockResolvedValue([])
    mockPrisma.deliverable.findMany.mockResolvedValue([])

    await runDailyPushJob(NOW)
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })

  it('removes stale subscription on 410 response', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1])
    mockPrisma.payment.findMany.mockResolvedValueOnce([
      {
        id: 'pay-1',
        dueDate: FOUR_DAYS_AGO,
        status: 'PENDING',
        deal: { id: 'd1', brandName: 'Acme' },
      },
    ])
    mockPrisma.payment.findMany.mockResolvedValueOnce([])
    mockPrisma.deliverable.findMany.mockResolvedValue([])
    ;(webpush.sendNotification as ReturnType<typeof vi.fn>).mockRejectedValue({ statusCode: 410 })
    mockPrisma.pushSubscription.deleteMany.mockResolvedValue({ count: 1 })

    await runDailyPushJob(NOW)
    expect(mockPrisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
      where: { id: SUB_1.id },
    })
  })

  it('does not remove subscription on non-410 error', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1])
    mockPrisma.payment.findMany.mockResolvedValueOnce([
      {
        id: 'pay-1',
        dueDate: FOUR_DAYS_AGO,
        status: 'PENDING',
        deal: { id: 'd1', brandName: 'Acme' },
      },
    ])
    mockPrisma.payment.findMany.mockResolvedValueOnce([])
    mockPrisma.deliverable.findMany.mockResolvedValue([])
    ;(webpush.sendNotification as ReturnType<typeof vi.fn>).mockRejectedValue({ statusCode: 500 })

    await runDailyPushJob(NOW)
    expect(mockPrisma.pushSubscription.deleteMany).not.toHaveBeenCalled()
  })

  it('handles multiple users with separate subscriptions', async () => {
    const sub2 = {
      id: 'sub-2',
      userId: 'user-2',
      endpoint: 'https://fcm.example.com/2',
      p256dh: 'p2',
      auth: 'a2',
    }
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1, sub2])
    mockPrisma.payment.findMany.mockResolvedValueOnce([
      {
        id: 'pay-1',
        dueDate: FOUR_DAYS_AGO,
        status: 'PENDING',
        deal: { id: 'd1', brandName: 'Brand' },
      },
    ])
    mockPrisma.payment.findMany.mockResolvedValueOnce([])
    mockPrisma.payment.findMany.mockResolvedValueOnce([
      {
        id: 'pay-1',
        dueDate: FOUR_DAYS_AGO,
        status: 'PENDING',
        deal: { id: 'd1', brandName: 'Brand' },
      },
    ])
    mockPrisma.payment.findMany.mockResolvedValueOnce([])
    mockPrisma.deliverable.findMany.mockResolvedValue([])

    await runDailyPushJob(NOW)
    // Each user gets one push
    expect(webpush.sendNotification).toHaveBeenCalledTimes(2)
  })
})
