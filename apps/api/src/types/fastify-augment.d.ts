import type { AuthUser } from '@oompa/types'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    /** Set by `authenticate` preHandler on protected routes. */
    authUser?: AuthUser
  }
}
