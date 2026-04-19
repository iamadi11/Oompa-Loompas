import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildServer } from './server.js'
import { startPushNotificationCron } from './jobs/push-notifications.js'
import { startEmailDigestCron } from './jobs/email-digest.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '../.env') })

const PORT = parseInt(process.env['PORT'] ?? '3001', 10)
const HOST = process.env['HOST'] ?? '0.0.0.0'

async function main() {
  const fastify = await buildServer()

  try {
    startPushNotificationCron()
    startEmailDigestCron()
    await fastify.listen({ port: PORT, host: HOST })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

void main()
