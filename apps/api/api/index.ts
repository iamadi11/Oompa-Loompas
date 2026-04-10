/**
 * Vercel serverless entry point for the Fastify API.
 *
 * Vercel invokes this as a Node.js serverless function. The Fastify instance is
 * cached across warm invocations to avoid cold-start overhead on each request.
 *
 * All routes match via the root rewrite in vercel.json:
 *   { source: "/(.*)", destination: "/api/index" }
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { buildServer } from '../src/server.js'
import type { FastifyInstance } from 'fastify'

let app: FastifyInstance | null = null

async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    app = await buildServer()
    await app.ready()
  }
  return app
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const fastify = await getApp()
  fastify.server.emit('request', req, res)
}
