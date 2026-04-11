import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma as db } from '@oompa/db';
import { getVapidPublicKey, initWebPush } from '../../lib/push-env.js';

export const pushRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  initWebPush();

  // GET /api/v1/push/public-key
  fastify.get('/public-key', async () => {
    return { data: { publicKey: getVapidPublicKey() } };
  });

  // POST /api/v1/push/subscribe
  fastify.post<{ Body: { endpoint: string; keys: { p256dh: string; auth: string } } }>(
    '/subscribe',
    async (request, reply) => {
      const { endpoint, keys } = request.body;
      const userId = request.authUser!.id;

      await db.pushSubscription.upsert({
        where: {
          userId_endpoint: {
            userId,
            endpoint
          }
        },
        create: {
          userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth
        },
        update: {
          p256dh: keys.p256dh,
          auth: keys.auth
        }
      });

      return reply.code(204).send();
    }
  );

  // DELETE /api/v1/push/unsubscribe
  fastify.delete<{ Body: { endpoint: string } }>(
    '/unsubscribe',
    async (request, reply) => {
      const { endpoint } = request.body;
      const userId = request.authUser!.id;

      await db.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint
        }
      });

      return reply.code(204).send();
    }
  );
};
