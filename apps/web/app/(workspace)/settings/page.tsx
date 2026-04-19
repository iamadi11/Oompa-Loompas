'use client'

import { useState, useEffect } from 'react'
import { urlBase64ToUint8Array, askNotificationPermission } from '@/lib/push'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(true)
  const [digestLoading, setDigestLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)

      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub)
        })
      })
    }

    void api.getNotificationSettings().then((res) => {
      if (res?.data) setEmailDigestEnabled(res.data.emailDigestEnabled)
    }).catch(() => {/* form remains usable */})
  }, [])

  const handlePushToggle = async () => {
    setLoading(true)
    try {
      const activeSw = await navigator.serviceWorker.ready
      const existingSub = await activeSw.pushManager.getSubscription()

      if (existingSub) {
        // Unsubscribe
        await api.unsubscribePush(existingSub.endpoint)
        await existingSub.unsubscribe()
        setIsSubscribed(false)
        toast.success('Notifications disabled')
      } else {
        // Subscribe
        const perm = await askNotificationPermission()
        setPermission(perm)
        if (perm !== 'granted') throw new Error('Permission denied')

        const res = await api.getPushPublicKey()
        const vapidKey = res.data.publicKey

        const subscription = await activeSw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        const pushSub = subscription.toJSON()
        await api.subscribePush({
          endpoint: pushSub.endpoint,
          keys: pushSub.keys,
        })

        setIsSubscribed(true)
        toast.success('Notifications enabled!')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update notification settings')
    } finally {
      setLoading(false)
    }
  }

  const isBlocked = permission === 'denied'

  const handleDigestToggle = async () => {
    setDigestLoading(true)
    try {
      const next = !emailDigestEnabled
      await api.updateNotificationSettings({ emailDigestEnabled: next })
      setEmailDigestEnabled(next)
      toast.success(next ? 'Daily digest enabled' : 'Daily digest disabled')
    } catch {
      toast.error('Failed to update email preferences')
    } finally {
      setDigestLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
        Settings
      </h1>

      <div className="rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-stone-900">Notifications</h2>
          <p className="text-sm text-stone-500 mt-1">
            Get OS-level alerts when payments or deliverables are overdue.
          </p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-canvas border border-line/60">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-stone-900">Push Notifications</span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-stone-300'}`}
              />
              <span className="text-xs text-stone-500">
                {isBlocked ? 'Blocked by browser' : isSubscribed ? 'Subscribed' : 'Not active'}
              </span>
            </div>
          </div>

          <Button
            onClick={() => void handlePushToggle()}
            disabled={loading || isBlocked}
            variant={isSubscribed ? 'secondary' : 'primary'}
            size="sm"
          >
            {loading ? 'Updating...' : isSubscribed ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {isBlocked && (
          <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 italic">
            Your browser has blocked notifications for this site. Please reset the permission in
            your browser address bar to enable them.
          </p>
        )}

        <div className="flex items-center justify-between p-4 rounded-xl bg-canvas border border-line/60">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-stone-900">Daily Email Digest</span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${emailDigestEnabled ? 'bg-green-500' : 'bg-stone-300'}`}
              />
              <span className="text-xs text-stone-500">
                {emailDigestEnabled ? 'Sent at 11:30 AM IST when items are overdue or due soon' : 'Disabled'}
              </span>
            </div>
          </div>
          <Button
            onClick={() => void handleDigestToggle()}
            disabled={digestLoading}
            variant={emailDigestEnabled ? 'secondary' : 'primary'}
            size="sm"
            aria-label={emailDigestEnabled ? 'Disable daily email digest' : 'Enable daily email digest'}
          >
            {digestLoading ? 'Updating...' : emailDigestEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card space-y-4 opacity-50 pointer-events-none">
        <div>
          <h2 className="font-display text-lg font-semibold text-stone-900">Account</h2>
          <p className="text-sm text-stone-500 mt-1">
            Manage your profile and currency preferences.
          </p>
        </div>
        <p className="text-xs text-stone-400 italic">Account settings coming soon.</p>
      </div>
    </div>
  )
}
