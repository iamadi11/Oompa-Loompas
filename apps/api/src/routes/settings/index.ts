import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { prisma } from '@oompa/db'

export const settingsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/settings/notifications
  fastify.get('/notifications', async (request) => {
    const userId = request.authUser!.id

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { emailDigestEnabled: true },
    })

    const pushEnabled = await prisma.pushSubscription
      .findFirst({ where: { userId }, select: { id: true } })
      .then((r) => r !== null)

    return { data: { emailDigestEnabled: user.emailDigestEnabled, pushEnabled } }
  })

  // PATCH /api/v1/settings/notifications
  fastify.patch<{ Body: { emailDigestEnabled?: boolean } }>(
    '/notifications',
    async (request, reply) => {
      const userId = request.authUser!.id
      const { emailDigestEnabled } = request.body

      if (typeof emailDigestEnabled === 'boolean') {
        await prisma.user.update({
          where: { id: userId },
          data: { emailDigestEnabled },
        })
      }

      return reply.code(204).send()
    },
  )
}
