import type { FastifyReply, FastifyRequest } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from '@oompa/db'
import { LoginBodySchema, type MeResponse } from '@oompa/types'
import { validate } from '@oompa/utils'
import { getSessionCookieName, getSessionSecret, getSessionTtlMs } from '../../lib/auth-env.js'
import { UnauthorizedError, ValidationError, sendError } from '../../lib/errors.js'
import { hashSessionToken, newSessionToken } from '../../lib/session-token.js'

/** Must match on login and logout so browsers actually drop the cookie. */
function sessionCookieBaseOptions(): {
  path: '/'
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax'
} {
  const secure = process.env['NODE_ENV'] === 'production'
  return { path: '/', httpOnly: true, secure, sameSite: 'lax' }
}

export async function postLogin(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply,
): Promise<void> {
  const parsed = validate(LoginBodySchema, request.body)
  if (!parsed.success) {
    sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
    return
  }

  const { email, password } = parsed.data
  const normalized = email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: normalized } })
  if (!user) {
    sendError(reply, new UnauthorizedError('Invalid email or password'))
    return
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    sendError(reply, new UnauthorizedError('Invalid email or password'))
    return
  }

  const rawToken = newSessionToken()
  const secret = getSessionSecret()
  const tokenHash = hashSessionToken(rawToken, secret)
  const expiresAt = new Date(Date.now() + getSessionTtlMs())

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  })

  const cookieName = getSessionCookieName()
  const maxAgeSeconds = Math.floor(getSessionTtlMs() / 1000)

  void reply
    .setCookie(cookieName, rawToken, {
      ...sessionCookieBaseOptions(),
      maxAge: maxAgeSeconds,
    })
    .status(200)
    .send({
      data: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    })
}

export async function postLogout(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const cookieName = getSessionCookieName()
  const token = request.cookies[cookieName]
  if (token) {
    const secret = getSessionSecret()
    const tokenHash = hashSessionToken(token, secret)
    await prisma.session.deleteMany({ where: { tokenHash } })
  }

  void reply
    .clearCookie(cookieName, sessionCookieBaseOptions())
    .status(204)
    .send()
}

export async function getMe(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const u = request.authUser
  if (!u) {
    sendError(reply, new UnauthorizedError())
    return
  }
  const body: MeResponse = { data: u }
  void reply.status(200).send(body)
}
