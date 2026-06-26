import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")

serve(async (req) => {
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`)
  const data = await resp.json()
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
})
