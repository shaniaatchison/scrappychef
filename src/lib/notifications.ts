import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported in this browser.')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('Push permission denied.')
      return
    }

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Save to database
    const subJson = subscription.toJSON()
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
      }, { onConflict: 'user_id, endpoint' })

    if (error) throw error
    
    // Enable notifications in profile
    await supabase
      .from('profiles')
      .update({ notifications_enabled: true })
      .eq('id', user.id)

    return true
  } catch (error) {
    console.error('Error subscribing to push:', error)
    return false
  }
}

function urlBase64ToUint8Array(base64String: string) {
  if (!base64String) return new Uint8Array(0)
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
