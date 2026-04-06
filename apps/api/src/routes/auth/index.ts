import type { FastifyInstance } from 'fastify'
import { getMe, postLogin, postLogout } from './handlers.js'

/**
 * Factory so `/me` can use the root `authenticate` decorator inside an encapsulated prefix.
 */
export function createAuthRoutes(root: FastifyInstance) {
  return async function authRoutes(instance: FastifyInstance): Promise<void> {
    const runAuth = root.authenticate.bind(root)
    instance.post('/login', postLogin)
    instance.post('/logout', postLogout)
    instance.get('/me', { preHandler: [runAuth] }, getMe)
  }
}
