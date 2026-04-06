import type { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import fp from 'fastify-plugin'

const DEFAULT_WEB = 'http://localhost:3000'

/** Local Next.js dev ports (see `apps/web` `dev` / `dev:clean`). */
const DEV_WEB_ORIGINS = [
  DEFAULT_WEB,
  'http://127.0.0.1:3000',
  'http://localhost:3005',
  'http://127.0.0.1:3005',
] as const

function developmentOrigins(webUrl: string): string[] {
  return [...new Set([webUrl, ...DEV_WEB_ORIGINS])]
}

/**
 * Must be wrapped with fastify-plugin: a bare async plugin creates an encapsulated
 * context, so @fastify/cors hooks would not run for routes on the parent instance
 * (only OPTIONS preflight on the child would look 'working' in the browser).
 */
export const corsPlugin = fp(
  async function oompaCors(fastify: FastifyInstance) {
    const webUrl = process.env['WEB_URL'] ?? DEFAULT_WEB
    const isProd = process.env['NODE_ENV'] === 'production'

    await fastify.register(cors, {
      origin: isProd ? webUrl : developmentOrigins(webUrl),
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    })
  },
  { name: 'oompa-cors' },
)
