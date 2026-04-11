import webpush from 'web-push';

let initialized = false;

export function initWebPush() {
  if (initialized) return;
  const publicKey = process.env['VAPID_PUBLIC_KEY'];
  const privateKey = process.env['VAPID_PRIVATE_KEY'];
  const subject = process.env['VAPID_SUBJECT'] || 'mailto:admin@test.dev';

  if (!publicKey || !privateKey) {
    if (process.env['NODE_ENV'] !== 'test') {
      console.warn('VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY not set. Web push will crash.');
    }
    return;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  initialized = true;
}

export function getVapidPublicKey() {
  const pk = process.env['VAPID_PUBLIC_KEY'];
  if (!pk) {
    if (process.env['NODE_ENV'] !== 'test') {
      throw new Error('VAPID_PUBLIC_KEY is not configured');
    }
    return 'fake-public-key-for-test';
  }
  return pk;
}
