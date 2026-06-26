import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ingredients } = await req.json()

    if (!ingredients || ingredients.length === 0) {
      return new Response(JSON.stringify({ error: 'No ingredients provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const prompt = `You are ScrappyChef, an expert in zero-waste cooking. 
    Given these ingredients: ${ingredients.join(", ")}, 
    generate a creative, delicious recipe that uses as many of them as possible.
    Focus on avoiding waste.
    
    IMPORTANT: Return ONLY a valid JSON object. No markdown, no extra text.
    
    Response format:
    {
      "title": "Recipe Name",
      "description": "Short description",
      "ingredients": [{"name": "item", "quantity": 1, "unit": "pcs"}],
      "steps": ["Step 1", "Step 2"],
      "difficulty": "easy",
      "prep_time": 15
    }`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    })

    const data = await response.json()
    console.log('Gemini response data:', JSON.stringify(data))
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!text) {
      console.error('Gemini error details:', JSON.stringify(data))
      throw new Error(`Gemini failed to generate content: ${data.error?.message || 'Unknown error'}`)
    }

    return new Response(text, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
