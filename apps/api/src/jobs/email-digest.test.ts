import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  buildDigestEmail,
  runDailyDigestJob,
  type OverduePaymentDigestItem,
  type UpcomingPaymentDigestItem,
  type UpcomingDeliverableDigestItem,
} from './email-digest.js'
import { prisma } from '@oompa/db'

// Mock the email sender so no real HTTP calls happen
vi.mock('../lib/email.js', () => ({
  sendEmail: vi.fn(),
  isEmailConfigured: vi.fn(() => true),
}))

import { sendEmail, isEmailConfigured } from '../lib/email.js'

const mockPrisma = prisma as typeof prisma & {
  user: { findMany: ReturnType<typeof vi.fn> }
  payment: { findMany: ReturnType<typeof vi.fn> }
  deliverable: { findMany: ReturnType<typeof vi.fn> }
}

const NOW = new Date('2026-04-19T06:00:00.000Z')
const WEB_URL = 'http://localhost:3000'

const OVERDUE_PAYMENT: OverduePaymentDigestItem = {
  dealId: 'deal-1',
  brandName: 'Nike',
  amount: 75000,
  currency: 'INR',
  daysOverdue: 5,
}

const UPCOMING_PAYMENT: UpcomingPaymentDigestItem = {
  dealId: 'deal-2',
  brandName: 'Zomato',
  amount: 50000,
  currency: 'INR',
  daysUntilDue: 2,
}

const UPCOMING_DELIVERABLE: UpcomingDeliverableDigestItem = {
  dealId: 'deal-3',
  deliverableTitle: 'YouTube Integration',
  brandName: 'Boat',
  daysUntilDue: 1,
}

// ─── buildDigestEmail — pure ──────────────────────────────────────────────────

describe('buildDigestEmail — subject line', () => {
  it('uses overdue subject when overdue payments exist', () => {
    const { subject } = buildDigestEmail(
      { overduePayments: [OVERDUE_PAYMENT], upcomingPayments: [], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(subject).toMatch(/1 overdue payment/i)
    expect(subject).toMatch(/action needed/i)
  })

  it('pluralises subject for multiple overdue payments', () => {
    const { subject } = buildDigestEmail(
      {
        overduePayments: [OVERDUE_PAYMENT, { ...OVERDUE_PAYMENT, dealId: 'deal-x' }],
        upcomingPayments: [],
        upcomingDeliverables: [],
      },
      WEB_URL,
    )
    expect(subject).toMatch(/2 overdue payments/i)
  })

  it('uses upcoming subject when no overdue payments', () => {
    const { subject } = buildDigestEmail(
      { overduePayments: [], upcomingPayments: [UPCOMING_PAYMENT], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(subject).toMatch(/upcoming/i)
  })
})

describe('buildDigestEmail — HTML content', () => {
  it('includes brand name in overdue section', () => {
    const { html } = buildDigestEmail(
      { overduePayments: [OVERDUE_PAYMENT], upcomingPayments: [], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(html).toContain('Nike')
  })

  it('includes formatted amount for overdue payment', () => {
    const { html } = buildDigestEmail(
      { overduePayments: [OVERDUE_PAYMENT], upcomingPayments: [], upcomingDeliverables: [] },
      WEB_URL,
    )
    // formatCurrency(75000, 'INR') produces ₹75,000 or similar
    expect(html).toMatch(/75[,.]?000/)
  })

  it('includes days overdue count', () => {
    const { html } = buildDigestEmail(
      { overduePayments: [OVERDUE_PAYMENT], upcomingPayments: [], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(html).toMatch(/5 days/)
  })

  it('includes deal deep-link for overdue payment', () => {
    const { html } = buildDigestEmail(
      { overduePayments: [OVERDUE_PAYMENT], upcomingPayments: [], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(html).toContain(`${WEB_URL}/deals/deal-1`)
  })

  it('includes upcoming payment brand and amount', () => {
    const { html } = buildDigestEmail(
      { overduePayments: [], upcomingPayments: [UPCOMING_PAYMENT], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(html).toContain('Zomato')
    expect(html).toMatch(/50[,.]?000/)
    expect(html).toContain(`${WEB_URL}/deals/deal-2`)
  })

  it('shows "due today" for daysUntilDue=0', () => {
    const { html } = buildDigestEmail(
      {
        overduePayments: [],
        upcomingPayments: [{ ...UPCOMING_PAYMENT, daysUntilDue: 0 }],
        upcomingDeliverables: [],
      },
      WEB_URL,
    )
    expect(html).toContain('due today')
  })

  it('includes upcoming deliverable title and brand', () => {
    const { html } = buildDigestEmail(
      { overduePayments: [], upcomingPayments: [], upcomingDeliverables: [UPCOMING_DELIVERABLE] },
      WEB_URL,
    )
    expect(html).toContain('YouTube Integration')
    expect(html).toContain('Boat')
    expect(html).toContain(`${WEB_URL}/deals/deal-3`)
  })

  it('includes settings opt-out link', () => {
    const { html } = buildDigestEmail(
      { overduePayments: [OVERDUE_PAYMENT], upcomingPayments: [], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(html).toContain(`${WEB_URL}/settings`)
  })

  it('escapes HTML in brand name', () => {
    const { html } = buildDigestEmail(
      {
        overduePayments: [{ ...OVERDUE_PAYMENT, brandName: '<script>alert(1)</script>' }],
        upcomingPayments: [],
        upcomingDeliverables: [],
      },
      WEB_URL,
    )
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('buildDigestEmail — plain text', () => {
  it('includes brand name and amount in text', () => {
    const { text } = buildDigestEmail(
      { overduePayments: [OVERDUE_PAYMENT], upcomingPayments: [], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(text).toContain('Nike')
    expect(text).toMatch(/75[,.]?000/)
  })

  it('includes deal URL in text', () => {
    const { text } = buildDigestEmail(
      { overduePayments: [OVERDUE_PAYMENT], upcomingPayments: [], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(text).toContain(`${WEB_URL}/deals/deal-1`)
  })

  it('includes settings URL in text footer', () => {
    const { text } = buildDigestEmail(
      { overduePayments: [OVERDUE_PAYMENT], upcomingPayments: [], upcomingDeliverables: [] },
      WEB_URL,
    )
    expect(text).toContain(`${WEB_URL}/settings`)
  })
})

// ─── runDailyDigestJob — integration ──────────────────────────────────────────

describe('runDailyDigestJob', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env['WEB_URL'] = WEB_URL
    ;(isEmailConfigured as ReturnType<typeof vi.fn>).mockReturnValue(true)
  })

  afterEach(() => {
    delete process.env['WEB_URL']
  })

  it('skips silently when email is not configured', async () => {
    ;(isEmailConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false)
    await runDailyDigestJob(NOW)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('skips when no opted-in users', async () => {
    mockPrisma.user.findMany.mockResolvedValue([])
    await runDailyDigestJob(NOW)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('skips user with no items', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 'user-1', email: 'u@test.com' }])
    mockPrisma.payment.findMany.mockResolvedValue([])
    mockPrisma.deliverable.findMany.mockResolvedValue([])
    await runDailyDigestJob(NOW)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('sends email for user with overdue payment', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 'user-1', email: 'creator@test.com' }])
    // getOverduePaymentsForDigest returns a row with overdue payment
    mockPrisma.payment.findMany
      .mockResolvedValueOnce([
        {
          id: 'pay-1',
          amount: { toNumber: () => 75000 },
          dueDate: new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1_000),
          deal: { id: 'deal-1', brandName: 'Nike', currency: 'INR' },
        },
      ])
      // getUpcomingPaymentsForDigest returns empty
      .mockResolvedValueOnce([])
    mockPrisma.deliverable.findMany.mockResolvedValue([])

    await runDailyDigestJob(NOW)

    expect(sendEmail).toHaveBeenCalledOnce()
    const call = (sendEmail as ReturnType<typeof vi.fn>).mock.calls[0]![0] as {
      to: string; subject: string; html: string; text: string
    }
    expect(call.to).toBe('creator@test.com')
    expect(call.subject).toMatch(/overdue/i)
    expect(call.html).toContain('Nike')
    expect(call.text).toContain('Nike')
  })

  it('does not send to user who has opted out (emailDigestEnabled=false filtered by query)', async () => {
    // The query filters emailDigestEnabled=true at DB level — this test confirms
    // the job only processes users returned by that query
    mockPrisma.user.findMany.mockResolvedValue([]) // query returns nothing (opted-out user filtered)
    await runDailyDigestJob(NOW)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('does not throw when one user query errors (job completes without crashing)', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 'user-err', email: 'bad@test.com' }])
    // All queries for this user fail
    mockPrisma.payment.findMany.mockRejectedValue(new Error('DB error'))
    mockPrisma.deliverable.findMany.mockRejectedValue(new Error('DB error'))

    // Job should complete without throwing
    await expect(runDailyDigestJob(NOW)).resolves.toBeUndefined()
    // No email sent since the user's data couldn't be fetched
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
