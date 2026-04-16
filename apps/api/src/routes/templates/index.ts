import type { FastifyInstance } from 'fastify'
import {
  listTemplates,
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from './handlers.js'

export async function templateRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', listTemplates)
  fastify.post('/', createTemplate)
  fastify.get('/:id', getTemplate)
  fastify.put('/:id', updateTemplate)
  fastify.delete('/:id', deleteTemplate)
}
