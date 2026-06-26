import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { score, username, moneySaved, lbsDiverted, streak, mealsCooked, referralCode, rank } = await req.json()

    // Generate SVG
    const svg = `
      <svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1080" height="1080" fill="#ecfdf5" />
        <rect x="20" y="20" width="1040" height="1040" fill="none" stroke="#10b981" stroke-width="40" />
        
        <text x="80" y="120" font-family="sans-serif" font-weight="bold" font-size="60" fill="#064e3b">ScrappyChef</text>
        
        <text x="540" y="300" font-family="sans-serif" font-weight="bold" font-size="80" fill="#065f46" text-anchor="middle">MY SCRAPPY SCORE</text>
        
        <text x="540" y="600" font-family="sans-serif" font-weight="bold" font-size="360" fill="#10b981" text-anchor="middle">${score}</text>
        
        <text x="540" y="700" font-family="sans-serif" font-size="50" fill="#064e3b" text-anchor="middle">I saved $${moneySaved.toFixed(2)} with ScrappyChef!</text>
        
        <text x="540" y="770" font-family="sans-serif" font-weight="bold" font-size="60" fill="#10b981" text-anchor="middle">RANK: ${rank.toUpperCase()}</text>
        
        <g transform="translate(270, 820)">
          <text x="0" y="0" font-family="sans-serif" font-weight="bold" font-size="60" fill="#064e3b" text-anchor="middle">${lbsDiverted.toFixed(1)}</text>
          <text x="0" y="50" font-family="sans-serif" font-size="40" fill="#6b7280" text-anchor="middle">Lbs Saved</text>
        </g>
        
        <g transform="translate(540, 820)">
          <text x="0" y="0" font-family="sans-serif" font-weight="bold" font-size="60" fill="#064e3b" text-anchor="middle">${streak}d</text>
          <text x="0" y="50" font-family="sans-serif" font-size="40" fill="#6b7280" text-anchor="middle">Streak</text>
        </g>
        
        <g transform="translate(810, 820)">
          <text x="0" y="0" font-family="sans-serif" font-weight="bold" font-size="60" fill="#064e3b" text-anchor="middle">${mealsCooked}</text>
          <text x="0" y="50" font-family="sans-serif" font-size="40" fill="#6b7280" text-anchor="middle">Meals</text>
        </g>
        
        <rect x="0" y="960" width="1080" height="120" fill="#10b981" />
        <text x="540" y="1035" font-family="sans-serif" font-weight="bold" font-size="50" fill="white" text-anchor="middle">USE CODE: ${referralCode}</text>
      </svg>
    `

    return new Response(svg, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
