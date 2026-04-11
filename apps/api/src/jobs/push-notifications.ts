import cron from 'node-cron';
import { prisma } from '@oompa/db';
import webpush from 'web-push';

export function startPushNotificationCron() {
  // CRON job running daily at 01:30 UTC / 07:00 IST
  cron.schedule('30 1 * * *', async () => {
    console.log('[CRON] Starting daily PWA push notifications sync');
    try {
      const users = await prisma.user.findMany({
        include: {
          pushSubscriptions: true,
          deals: {
            where: {
              status: 'ACTIVE'
            },
            include: {
              payments: {
                where: {
                  status: 'PENDING',
                  dueDate: { lte: new Date() }
                }
              },
              deliverables: {
                where: {
                  status: 'PENDING',
                  dueDate: { lte: new Date() }
                }
              }
            }
          }
        }
      });

      for (const user of users) {
        if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) continue;

        let overduePayments = 0;
        let overdueDeliverables = 0;

        for (const deal of user.deals) {
          overduePayments += deal.payments.length;
          overdueDeliverables += deal.deliverables.length;
        }

        if (overduePayments > 0 || overdueDeliverables > 0) {
          const payload = JSON.stringify({
            title: 'Action Requires Your Attention',
            body: `You have ${overduePayments} overdue payments and ${overdueDeliverables} overdue deliverables.`,
            icon: '/icon512_maskable.png',
            badge: '/icon512_maskable.png'
          });

          // Limit to max 3 notifications or combine into 1. The architecture actually says "combines multiple overdue items into a single notification". SOT §25.2
          // Send to all their subscriptions
          for (const sub of user.pushSubscriptions) {
            try {
              const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth
                }
              };
              await webpush.sendNotification(pushSubscription, payload);
            } catch (err: any) {
              if (err.statusCode === 410 || err.statusCode === 404) {
                console.log('[CRON] Removing obsolete push subscription:', sub.endpoint);
                await prisma.pushSubscription.delete({ where: { id: sub.id } });
              } else {
                console.error('[CRON] Error sending push notification:', err);
              }
            }
          }
        }
      }
      console.log('[CRON] Finished daily PWA push notifications sync');
    } catch (err) {
      console.error('[CRON] Failed to run push notification cron job:', err);
    }
  });

  console.log('[CRON] Push notification cron scheduled (01:30 UTC)');
}
