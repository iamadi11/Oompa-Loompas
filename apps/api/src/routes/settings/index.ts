import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { prisma } from '@oompa/db'

export const settingsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/settings/notifications
  fastify.get('/notifications', async (request) => {
    const userId = request.authUser!.id

    const [user, pushSub] = await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { emailDigestEnabled: true, followupEmailsEnabled: true },
      }),
      prisma.pushSubscription.findFirst({ where: { userId }, select: { id: true } }),
    ])

    return {
      data: {
        emailDigestEnabled: user.emailDigestEnabled,
        followupEmailsEnabled: user.followupEmailsEnabled,
        pushEnabled: pushSub !== null,
      },
    }
  })

  // PATCH /api/v1/settings/notifications
  fastify.patch<{ Body: { emailDigestEnabled?: boolean; followupEmailsEnabled?: boolean } }>(
    '/notifications',
    async (request, reply) => {
      const userId = request.authUser!.id
      const { emailDigestEnabled, followupEmailsEnabled } = request.body

      const data: { emailDigestEnabled?: boolean; followupEmailsEnabled?: boolean } = {}
      if (typeof emailDigestEnabled === 'boolean') data.emailDigestEnabled = emailDigestEnabled
      if (typeof followupEmailsEnabled === 'boolean') data.followupEmailsEnabled = followupEmailsEnabled

      if (Object.keys(data).length > 0) {
        await prisma.user.update({ where: { id: userId }, data })
      }

      return reply.code(204).send()
    },
  )
}
