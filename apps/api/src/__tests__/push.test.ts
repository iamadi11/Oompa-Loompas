import { describe, it, expect, beforeEach, vi } from 'vitest';

import { buildServer } from '../server.js';
import { testAuthCookieHeader, TEST_USER_ID, mockSessionFindUnique } from './auth-test-helpers.js';
import { prisma } from '@oompa/db';
import * as pushEnv from '../lib/push-env.js';

const mockPrisma = prisma as any;
const auth = testAuthCookieHeader();

describe('Push Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/push/public-key', () => {
    it('returns the VAPID public key', async () => {
      vi.spyOn(pushEnv, 'getVapidPublicKey').mockReturnValue('mock-vapid-key');
      mockSessionFindUnique(mockPrisma.session.findUnique, {
        userId: TEST_USER_ID,
        roles: ['MEMBER'],
      });

      const fastify = await buildServer();
      const resp = await fastify.inject({
        method: 'GET',
        url: '/api/v1/push/public-key',
        headers: auth
      });
      expect(resp.statusCode).toBe(200);
      expect(resp.json().data.publicKey).toBe('mock-vapid-key');
      await fastify.close();
    });
    
    it('returns 401 unauthenticated if not logged in', async () => {
      const fastify = await buildServer();
      const resp = await fastify.inject({
        method: 'GET',
        url: '/api/v1/push/public-key',
      });
      expect(resp.statusCode).toBe(401);
      await fastify.close();
    });
  });

  describe('POST /api/v1/push/subscribe', () => {
    it('creates a new push subscription', async () => {
      mockSessionFindUnique(mockPrisma.session.findUnique, {
        userId: TEST_USER_ID,
        roles: ['MEMBER'],
      });
      mockPrisma.pushSubscription.upsert.mockResolvedValue({});

      const fastify = await buildServer();
      const payload = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/fake-endpoint',
        keys: {
          p256dh: 'fake-p256dh',
          auth: 'fake-auth'
        }
      };

      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/push/subscribe',
        headers: auth,
        payload
      });

      expect(resp.statusCode).toBe(204);
      expect(mockPrisma.pushSubscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ p256dh: 'fake-p256dh' })
        })
      );
      await fastify.close();
    });
  });

  describe('DELETE /api/v1/push/unsubscribe', () => {
    it('deletes an existing push subscription', async () => {
      mockSessionFindUnique(mockPrisma.session.findUnique, {
        userId: TEST_USER_ID,
        roles: ['MEMBER'],
      });
      mockPrisma.pushSubscription.deleteMany.mockResolvedValue({ count: 1 });

      const fastify = await buildServer();
      const resp = await fastify.inject({
        method: 'DELETE',
        url: '/api/v1/push/unsubscribe',
        headers: auth,
        payload: { endpoint: 'fake-endpoint-to-delete' }
      });

      if (resp.statusCode === 500) console.log('DELETE /unsubscribe err:', resp.body);
      expect(resp.statusCode).toBe(204);
      expect(mockPrisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_ID, endpoint: 'fake-endpoint-to-delete' }
      });
      await fastify.close();
    });
  });
});
