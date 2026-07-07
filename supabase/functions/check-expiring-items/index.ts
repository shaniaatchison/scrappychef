import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0"
import webpush from "https://esm.sh/web-push@3.6.3"

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@scrappychef.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  
  // Get date range: today to 2 days from now
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  const twoDaysFromNow = new Date()
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
  const twoDaysStr = twoDaysFromNow.toISOString().split('T')[0]

  console.log(`Checking for items expiring between ${today} and ${twoDaysStr}`)

  // Query for items expiring soon for premium users who have notifications enabled
  const { data: expiringItems, error } = await supabase
    .from('user_pantries')
    .select(`
      id, 
      custom_name, 
      expiration_date, 
      user_id,
      profiles!inner(is_premium, notifications_enabled),
      ingredients(name)
    `)
    .lte('expiration_date', twoDaysStr)
    .gte('expiration_date', today)
    .eq('profiles.is_premium', true)
    .eq('profiles.notifications_enabled', true)

  if (error) {
    console.error('Error fetching expiring items:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Group by user
  const userNotifications = expiringItems.reduce((acc: any, item: any) => {
    if (!acc[item.user_id]) acc[item.user_id] = []
    const name = (Array.isArray(item.ingredients) ? item.ingredients[0]?.name : item.ingredients?.name) || item.custom_name
    acc[item.user_id].push(name)
    return acc
  }, {})

  const results = []
  
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not set. Skipping push notifications.')
    return new Response(JSON.stringify({ 
      message: 'VAPID keys not set', 
      expiringCount: expiringItems.length,
      usersToNotify: Object.keys(userNotifications).length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }

  for (const userId in userNotifications) {
    const items = userNotifications[userId]
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title: 'Expiring Soon!',
        body: `You have ${items.length} item(s) expiring soon: ${items.join(', ')}. Use them up!`,
        icon: '/icons/icon-192x192.png',
        data: { url: '/' }
      })

      for (const sub of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          }
          await webpush.sendNotification(pushSubscription, payload)
          results.push({ userId, status: 'sent' })
        } catch (err: any) {
          console.error(`Error sending push to user ${userId}:`, err)
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription expired or no longer valid
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          }
          results.push({ userId, status: 'failed', error: err.message })
        }
      }
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
})
