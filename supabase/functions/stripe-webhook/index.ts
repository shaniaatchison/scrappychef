import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0"
import Stripe from "https://esm.sh/stripe@11.16.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  const body = await req.text()
  let event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const userId = session.client_reference_id
    const customerId = session.customer
    const subscriptionId = session.subscription

    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_premium: true, 
          subscription_status: 'premium',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId
        })
        .eq('id', userId)
      
      if (error) console.error('Error updating profile:', error)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    const customerId = subscription.customer

    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: false, 
        subscription_status: 'free' 
      })
      .eq('stripe_customer_id', customerId)
    
    if (error) console.error('Error updating profile on deletion:', error)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})
