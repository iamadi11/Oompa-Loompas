import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  buildNotificationPayloads,
  runDailyPushJob,
  MAX_NOTIFICATIONS_PER_USER,
  type OverduePaymentItem,
  type DueTodayDeliverableItem,
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
    expect(buildNotificationPayloads([], [])).toEqual([])
  })

  it('builds overdue payment notification with correct copy', () => {
    const payments: OverduePaymentItem[] = [{ dealId: 'd1', brandName: 'Acme', daysOverdue: 4 }]
    const payloads = buildNotificationPayloads(payments, [])
    expect(payloads).toHaveLength(1)
    expect(payloads[0]?.title).toBe('Payment overdue')
    expect(payloads[0]?.body).toBe('Acme payment 4 days overdue')
    expect(payloads[0]?.url).toBe('/deals/d1')
  })

  it('uses singular "day" when daysOverdue is 1', () => {
    const payments: OverduePaymentItem[] = [{ dealId: 'd1', brandName: 'Brand', daysOverdue: 1 }]
    const payloads = buildNotificationPayloads(payments, [])
    expect(payloads[0]?.body).toBe('Brand payment 1 day overdue')
  })

  it('builds due-today deliverable notification with correct copy', () => {
    const deliverables: DueTodayDeliverableItem[] = [
      { dealId: 'd2', deliverableTitle: 'Reel', brandName: 'SomeBrand' },
    ]
    const payloads = buildNotificationPayloads([], deliverables)
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
    const payloads = buildNotificationPayloads(payments, [])
    expect(payloads).toHaveLength(MAX_NOTIFICATIONS_PER_USER)
  })

  it('fills remaining slots with deliverables after payments cap is not full', () => {
    const payments: OverduePaymentItem[] = [{ dealId: 'd1', brandName: 'Brand', daysOverdue: 5 }]
    const deliverables: DueTodayDeliverableItem[] = [
      { dealId: 'd2', deliverableTitle: 'Video', brandName: 'Brand2' },
      { dealId: 'd3', deliverableTitle: 'Post', brandName: 'Brand3' },
    ]
    const payloads = buildNotificationPayloads(payments, deliverables)
    expect(payloads).toHaveLength(3)
    expect(payloads[0]?.title).toBe('Payment overdue')
    expect(payloads[1]?.title).toBe('Deliverable due today')
    expect(payloads[2]?.title).toBe('Deliverable due today')
  })

  it('no payment amounts in body (SOT §25.2 privacy)', () => {
    const payments: OverduePaymentItem[] = [{ dealId: 'd1', brandName: 'Acme', daysOverdue: 4 }]
    const payloads = buildNotificationPayloads(payments, [])
    // Body must not contain currency symbols or numbers that look like amounts
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
    mockPrisma.payment.findMany.mockResolvedValue([
      {
        id: 'pay-1',
        dueDate: FOUR_DAYS_AGO,
        status: 'PENDING',
        deal: { id: 'd1', brandName: 'Acme Corp' },
      },
    ])
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
    mockPrisma.deliverable.findMany.mockResolvedValue([
      {
        id: 'del-1',
        title: 'Instagram Reel',
        status: 'PENDING',
        dueDate: NOW,
        deal: { id: 'd2', brandName: 'BrandX' },
      },
    ])

    await runDailyPushJob(NOW)

    expect(webpush.sendNotification).toHaveBeenCalledOnce()
    const payloadStr = (webpush.sendNotification as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[1] as string
    const payload = JSON.parse(payloadStr) as { title: string; body: string }
    expect(payload.title).toBe('Deliverable due today')
    expect(payload.body).toContain('BrandX')
  })

  it('skips user when no overdue items', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1])
    mockPrisma.payment.findMany.mockResolvedValue([])
    mockPrisma.deliverable.findMany.mockResolvedValue([])

    await runDailyPushJob(NOW)
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })

  it('removes stale subscription on 410 response', async () => {
    mockPrisma.pushSubscription.findMany.mockResolvedValue([SUB_1])
    mockPrisma.payment.findMany.mockResolvedValue([
      {
        id: 'pay-1',
        dueDate: FOUR_DAYS_AGO,
        status: 'PENDING',
        deal: { id: 'd1', brandName: 'Acme' },
      },
    ])
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
    mockPrisma.payment.findMany.mockResolvedValue([
      {
        id: 'pay-1',
        dueDate: FOUR_DAYS_AGO,
        status: 'PENDING',
        deal: { id: 'd1', brandName: 'Acme' },
      },
    ])
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
    mockPrisma.payment.findMany.mockResolvedValue([
      {
        id: 'pay-1',
        dueDate: FOUR_DAYS_AGO,
        status: 'PENDING',
        deal: { id: 'd1', brandName: 'Brand' },
      },
    ])
    mockPrisma.deliverable.findMany.mockResolvedValue([])

    await runDailyPushJob(NOW)
    // Each user gets one push
    expect(webpush.sendNotification).toHaveBeenCalledTimes(2)
  })
})
