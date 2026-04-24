import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'

// ─── Shared test fixtures ──────────────────────────────────────────────────

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  user: {
    findUnique: ReturnType<typeof vi.fn>
    findUniqueOrThrow: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  payment: { findMany: ReturnType<typeof vi.fn> }
  paymentFollowupEmail: {
    createMany: ReturnType<typeof vi.fn>
  }
  session: { findUnique: ReturnType<typeof vi.fn> }
  pushSubscription: { findFirst: ReturnType<typeof vi.fn> }
}

vi.mock('../lib/email.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  isEmailConfigured: vi.fn().mockReturnValue(true),
}))

// ─── Settings API extensions ───────────────────────────────────────────────

describe('GET /api/v1/settings/notifications — followupEmailsEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('returns followupEmailsEnabled in response', async () => {
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
      emailDigestEnabled: true,
      followupEmailsEnabled: true,
    })
    mockPrisma.pushSubscription.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/v1/settings/notifications',
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { followupEmailsEnabled: boolean } }>()
    expect(body.data.followupEmailsEnabled).toBe(true)
  })

  it('returns followupEmailsEnabled=false when disabled', async () => {
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
      emailDigestEnabled: true,
      followupEmailsEnabled: false,
    })
    mockPrisma.pushSubscription.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/v1/settings/notifications',
      headers: auth,
    })

    const body = res.json<{ data: { followupEmailsEnabled: boolean } }>()
    expect(body.data.followupEmailsEnabled).toBe(false)
  })
})

describe('PATCH /api/v1/settings/notifications — followupEmailsEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('updates followupEmailsEnabled to false', async () => {
    mockPrisma.user.update.mockResolvedValue({ followupEmailsEnabled: false })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/api/v1/settings/notifications',
      headers: auth,
      payload: { followupEmailsEnabled: false },
    })

    expect(res.statusCode).toBe(204)
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: TEST_USER_ID },
        data: expect.objectContaining({ followupEmailsEnabled: false }),
      }),
    )
  })

  it('updates followupEmailsEnabled to true', async () => {
    mockPrisma.user.update.mockResolvedValue({ followupEmailsEnabled: true })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/api/v1/settings/notifications',
      headers: auth,
      payload: { followupEmailsEnabled: true },
    })

    expect(res.statusCode).toBe(204)
  })

  it('ignores followupEmailsEnabled if not in body', async () => {
    const fastify = await buildServer()
    await fastify.inject({
      method: 'PATCH',
      url: '/api/v1/settings/notifications',
      headers: auth,
      payload: {},
    })
    // update should not be called at all (no-op for empty body)
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })
})

// ─── Cron job ──────────────────────────────────────────────────────────────

describe('runPaymentFollowupJob', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns early if email not configured', async () => {
    const { isEmailConfigured } = await import('../lib/email.js')
    vi.mocked(isEmailConfigured).mockReturnValue(false)

    const { runPaymentFollowupJob } = await import('../jobs/payment-followup.js')
    await runPaymentFollowupJob(new Date('2026-04-25'))

    expect(mockPrisma.user.findMany).not.toHaveBeenCalled()
  })

  it('returns early if no opted-in users', async () => {
    const { isEmailConfigured, sendEmail } = await import('../lib/email.js')
    vi.mocked(isEmailConfigured).mockReturnValue(true)
    mockPrisma.user.findMany.mockResolvedValue([])

    const { runPaymentFollowupJob } = await import('../jobs/payment-followup.js')
    await runPaymentFollowupJob(new Date('2026-04-25'))

    expect(vi.mocked(sendEmail)).not.toHaveBeenCalled()
  })

  it('sends email when a payment crosses 3-day threshold', async () => {
    const { isEmailConfigured, sendEmail } = await import('../lib/email.js')
    vi.mocked(isEmailConfigured).mockReturnValue(true)

    const now = new Date('2026-04-25T07:30:00Z')
    const dueDate = new Date('2026-04-22T00:00:00Z') // 3 days ago

    mockPrisma.user.findMany.mockResolvedValue([
      { id: TEST_USER_ID, email: 'creator@test.dev' },
    ])
    mockPrisma.payment.findMany.mockImplementation((args: { where: { dueDate: { gte: Date; lte: Date } } }) => {
      // Return a 3d payment on first call (3d threshold query), empty on others
      const { gte, lte } = args.where.dueDate
      if (dueDate >= gte && dueDate <= lte) {
        return Promise.resolve([{
          id: 'pay-1',
          amount: { toNumber: () => 75000 },
          dueDate,
          deal: { id: 'deal-1', title: 'Nike Q2', brandName: 'Nike', currency: 'INR' },
        }])
      }
      return Promise.resolve([])
    })
    mockPrisma.paymentFollowupEmail.createMany.mockResolvedValue({ count: 1 })

    const { runPaymentFollowupJob } = await import('../jobs/payment-followup.js')
    await runPaymentFollowupJob(now)

    expect(vi.mocked(sendEmail)).toHaveBeenCalledOnce()
    const callArgs = vi.mocked(sendEmail).mock.calls[0]![0]
    expect(callArgs.to).toBe('creator@test.dev')
    expect(callArgs.subject).toMatch(/follow.?up|3 day/i)
  })

  it('records sent threshold in paymentFollowupEmail table', async () => {
    const { isEmailConfigured } = await import('../lib/email.js')
    vi.mocked(isEmailConfigured).mockReturnValue(true)

    const now = new Date('2026-04-25T07:30:00Z')
    const dueDate = new Date('2026-04-22T00:00:00Z')

    mockPrisma.user.findMany.mockResolvedValue([{ id: TEST_USER_ID, email: 'creator@test.dev' }])
    mockPrisma.payment.findMany.mockImplementation((args: { where: { dueDate: { gte: Date; lte: Date } } }) => {
      const { gte, lte } = args.where.dueDate
      if (dueDate >= gte && dueDate <= lte) {
        return Promise.resolve([{
          id: 'pay-1',
          amount: { toNumber: () => 50000 },
          dueDate,
          deal: { id: 'deal-1', title: 'Test Deal', brandName: 'BrandX', currency: 'INR' },
        }])
      }
      return Promise.resolve([])
    })
    mockPrisma.paymentFollowupEmail.createMany.mockResolvedValue({ count: 1 })

    const { runPaymentFollowupJob } = await import('../jobs/payment-followup.js')
    await runPaymentFollowupJob(now)

    expect(mockPrisma.paymentFollowupEmail.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ paymentId: 'pay-1', dayThreshold: 3 }),
        ]),
        skipDuplicates: true,
      }),
    )
  })

  it('continues for other users when one user throws', async () => {
    const { isEmailConfigured, sendEmail } = await import('../lib/email.js')
    vi.mocked(isEmailConfigured).mockReturnValue(true)

    const now = new Date('2026-04-25T07:30:00Z')
    const dueDate = new Date('2026-04-22T00:00:00Z')

    mockPrisma.user.findMany.mockResolvedValue([
      { id: 'user-bad', email: 'bad@test.dev' },
      { id: TEST_USER_ID, email: 'good@test.dev' },
    ])
    mockPrisma.payment.findMany
      .mockRejectedValueOnce(new Error('DB error for bad user'))
      .mockImplementation((args: { where: { dueDate: { gte: Date; lte: Date }; deal: { userId: string } } }) => {
        const { gte, lte } = args.where.dueDate
        if (dueDate >= gte && dueDate <= lte) {
          return Promise.resolve([{
            id: 'pay-1',
            amount: { toNumber: () => 50000 },
            dueDate,
            deal: { id: 'deal-1', title: 'Good Deal', brandName: 'GoodBrand', currency: 'INR' },
          }])
        }
        return Promise.resolve([])
      })
    mockPrisma.paymentFollowupEmail.createMany.mockResolvedValue({ count: 1 })

    const { runPaymentFollowupJob } = await import('../jobs/payment-followup.js')
    await expect(runPaymentFollowupJob(now)).resolves.not.toThrow()

    // At least one email sent (for the good user)
    expect(vi.mocked(sendEmail)).toHaveBeenCalled()
  })
})
