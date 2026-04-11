import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../server.js';
import { createAuthSession, createDbUser } from './auth-test-helpers.js';
import { prisma as db } from '@oompa/db';

describe('Push Notifications API', () => {
  let app: FastifyInstance;
  let userId: string;
  let sessionToken: string;
  let cookie: string;

  beforeEach(async () => {
    app = await buildServer({ logger: false });
    const user = await createDbUser();
    userId = user.id;
    const session = await createAuthSession(userId);
    sessionToken = session.token;
    cookie = `session=${sessionToken}`;
  });

  afterEach(async () => {
    await db.pushSubscription.deleteMany({});
    await db.session.deleteMany({});
    await db.user.deleteMany({});
    await app.close();
  });

  describe('GET /api/v1/push/public-key', () => {
    it('returns the VAPID public key', async () => {
      const resp = await app.inject({
        method: 'GET',
        url: '/api/v1/push/public-key',
        headers: { cookie }
      });
      expect(resp.statusCode).toBe(200);
      const json = resp.json();
      expect(json.data.publicKey).toBeDefined();
      expect(typeof json.data.publicKey).toBe('string');
    });
    
    it('returns 401 unauthenticated if not logged in', async () => {
      const resp = await app.inject({
        method: 'GET',
        url: '/api/v1/push/public-key',
      });
      expect(resp.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/push/subscribe', () => {
    it('creates a new push subscription', async () => {
      const payload = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/fake-endpoint',
        keys: {
          p256dh: 'fake-p256dh',
          auth: 'fake-auth'
        }
      };

      const resp = await app.inject({
        method: 'POST',
        url: '/api/v1/push/subscribe',
        headers: { cookie },
        payload
      });

      expect(resp.statusCode).toBe(204);

      const sub = await db.pushSubscription.findFirst({
        where: { userId }
      });
      expect(sub).toBeDefined();
      expect(sub?.endpoint).toBe(payload.endpoint);
      expect(sub?.p256dh).toBe(payload.keys.p256dh);
      expect(sub?.auth).toBe(payload.keys.auth);
    });

    it('updates existing subscription with same endpoint for user', async () => {
      const payload = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/fake-endpoint',
        keys: {
          p256dh: 'old-p256dh',
          auth: 'old-auth'
        }
      };
      
      await app.inject({
        method: 'POST',
        url: '/api/v1/push/subscribe',
        headers: { cookie },
        payload
      });

      // Same endpoint, but keys rotated
      payload.keys.p256dh = 'new-p256dh';
      
      const resp2 = await app.inject({
        method: 'POST',
        url: '/api/v1/push/subscribe',
        headers: { cookie },
        payload
      });

      expect(resp2.statusCode).toBe(204);

      const subs = await db.pushSubscription.findMany({ where: { userId } });
      expect(subs).toHaveLength(1);
      expect(subs[0].p256dh).toBe('new-p256dh');
    });
  });

  describe('DELETE /api/v1/push/unsubscribe', () => {
    it('deletes an existing push subscription', async () => {
      await db.pushSubscription.create({
        data: {
          userId,
          endpoint: 'fake-endpoint-to-delete',
          p256dh: 'fake',
          auth: 'fake'
        }
      });

      const resp = await app.inject({
        method: 'DELETE',
        url: '/api/v1/push/unsubscribe',
        headers: { cookie },
        payload: { endpoint: 'fake-endpoint-to-delete' }
      });

      expect(resp.statusCode).toBe(204);

      const subs = await db.pushSubscription.findMany({ where: { userId } });
      expect(subs).toHaveLength(0);
    });
  });
});
