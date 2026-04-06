import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { prisma } from '@oompa/db'
import type { AuthUser } from '@oompa/types'
import { getSessionCookieName, getSessionSecret } from '../lib/auth-env.js'
import { UnauthorizedError, sendError } from '../lib/errors.js'
import { hashSessionToken } from '../lib/session-token.js'

async function authenticate(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const name = getSessionCookieName()
  const token = request.cookies[name]
  if (!token) {
    sendError(reply, new UnauthorizedError())
    return
  }
  const secret = getSessionSecret()
  const tokenHash = hashSessionToken(token, secret)
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  })
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    sendError(reply, new UnauthorizedError('Invalid or expired session'))
    return
  }
  const roles = session.user.roles as AuthUser['roles']
  request.authUser = {
    id: session.user.id,
    email: session.user.email,
    roles,
  }
}

export const authPlugin = fp(
  async function oompaAuth(fastify: FastifyInstance) {
    await Promise.resolve()
    fastify.decorate('authenticate', authenticate)
  },
  { name: 'oompa-auth' },
)
