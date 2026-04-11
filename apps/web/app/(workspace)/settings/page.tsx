'use client';

import { useState, useEffect } from 'react';
import { urlBase64ToUint8Array, askNotificationPermission, registerServiceWorker } from '../../../lib/push';

export default function SettingsPage() {
  const [permission, setPermission] = useState<string>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribePush = async () => {
    setLoading(true);
    try {
      const sw = await registerServiceWorker();
      if (!sw) throw new Error('Service workers not supported');

      const perm = await askNotificationPermission();
      setPermission(perm);
      if (perm !== 'granted') throw new Error('Permission denied');

      const activeSw = await navigator.serviceWorker.ready;
      
      const response = await fetch('http://localhost:3001/api/v1/push/public-key', {credentials: 'include'});
      const payload = await response.json();
      const vapidKey = payload.data.publicKey;

      const subscription = await activeSw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      const pushSub = subscription.toJSON();
      
      await fetch('http://localhost:3001/api/v1/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: pushSub.endpoint,
          keys: pushSub.keys
        })
      });
      alert('Successfully subscribed to notifications!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to subscribe: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <div className="border p-4 rounded-lg bg-white/5 space-y-4">
        <h2 className="text-xl font-semibold">Push Notifications</h2>
        <p className="text-sm text-gray-400">Receive alerts when deals or deliverables become overdue.</p>
        
        <div>
          <span className="text-sm shadow-sm mr-2">Status: {permission}</span>
          {permission !== 'granted' && (
            <button
              onClick={subscribePush}
              disabled={loading}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium text-white"
            >
              {loading ? 'Subscribing...' : 'Enable Notifications'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
