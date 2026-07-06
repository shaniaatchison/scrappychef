import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const CONTENT_PILLARS = [
  {
    name: "Liquid Gold",
    focus: "Scrap broths & infusions",
    ingredients: ["onion skins", "carrot peels", "celery ends", "herb stems", "garlic skins", "parmesan rinds"]
  },
  {
    name: "The Green Resurrection",
    focus: "Windowsill regrowing and using greens",
    ingredients: ["carrot tops", "beet greens", "radish leaves", "scallion ends", "lettuce bases"]
  },
  {
    name: "Use-It-Up Meal Templates",
    focus: "Fridge cleanout recipes",
    ingredients: ["wilting spinach", "soft tomatoes", "stale bread", "overripe bananas", "leftover rice"]
  },
  {
    name: "Shelf-Life Extension",
    focus: "Food science hacks and preservation",
    ingredients: ["excess herbs", "half-used lemons", "bruised apples", "sour milk"]
  }
]

serve(async (req) => {
  try {
    const supabase = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    // 1. Pick a random pillar and some ingredients
    const pillar = CONTENT_PILLARS[Math.floor(Math.random() * CONTENT_PILLARS.length)]
    const selectedIngredients = pillar.ingredients.sort(() => 0.5 - Math.random()).slice(0, 3)

    console.log(`Generating content for pillar: ${pillar.name} with ingredients: ${selectedIngredients.join(', ')}`)

    // 2. Call Gemini to generate a viral recipe
    const prompt = `You are ScrappyChef, a viral zero-waste cooking influencer. 
    Generate a high-engagement, viral-potential recipe for our "${pillar.name}" series (Focus: ${pillar.focus}).
    Base the recipe on these ingredients: ${selectedIngredients.join(", ")}.
    
    The recipe should be creative, easy to follow, and emphasize the environmental impact.
    
    IMPORTANT: Return ONLY a valid JSON object. No markdown, no extra text.
    
    Response format:
    {
      "title": "Catchy Recipe Name",
      "description": "Short, punchy viral description for social media",
      "ingredients": [{"name": "item", "quantity": 1, "unit": "pcs"}],
      "steps": ["Step 1", "Step 2"],
      "caption": "Viral social media caption with emojis and #ScrappyChef #ZeroWaste tags"
    }`

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    })

    const data = await geminiResponse.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!text) {
      throw new Error(`Gemini failed to generate content: ${JSON.stringify(data)}`)
    }

    const recipeData = JSON.parse(text)

    // 3. Insert into recipes table
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        title: recipeData.title,
        description: recipeData.description,
        ingredients_json: recipeData.ingredients,
        instructions: recipeData.steps.join('\n'),
        // Assuming we have a 'is_system_generated' or similar flag, or just use a specific user_id
        // For now, we'll just insert it.
      })
      .select()
      .single()

    if (recipeError) throw recipeError

    // 4. Insert into video_queue
    const { error: queueError } = await supabase
      .from('video_queue')
      .insert({
        recipe_id: recipe.id,
        caption: recipeData.caption,
        status: 'pending',
        metadata: {
          pillar: pillar.name,
          generated_at: new Date().toISOString()
        }
      })

    if (queueError) throw queueError

    return new Response(JSON.stringify({ success: true, recipe_id: recipe.id, pillar: pillar.name }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error in auto-generate-video-content:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
