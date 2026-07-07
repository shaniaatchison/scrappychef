import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@11.16.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  try {
    console.log("Listing products...")
    const products = await stripe.products.list({ limit: 10 })
    console.log(`Found ${products.data.length} products`)

    let product = products.data.find(p => p.name === 'ScrappyChef Premium')
    
    if (!product) {
      console.log("Product not found. Creating...")
      product = await stripe.products.create({
        name: 'ScrappyChef Premium',
        description: 'Premium access to ScrappyChef features',
      })
    }

    console.log(`Product ID: ${product.id}`)

    console.log("Listing prices for product...")
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 10,
    })

    let price = prices.data.find(p => p.unit_amount === 999 && p.recurring?.interval === 'month')

    if (!price) {
      console.log("Price not found. Creating...")
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 999,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      })
    }

    return new Response(JSON.stringify({ 
      productId: product.id, 
      priceId: price.id,
      isLiveMode: price.livemode
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
