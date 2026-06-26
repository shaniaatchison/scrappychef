import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import postgres from "https://deno.land/x/postgresjs@v3.3.3/mod.js"

serve(async (req) => {
  try {
    const { sql } = await req.json()
    const databaseUrl = Deno.env.get("SUPABASE_DB_URL")
    if (!databaseUrl) {
      return new Response(JSON.stringify({ error: "SUPABASE_DB_URL not found" }), { status: 500 })
    }
    const sql_client = postgres(databaseUrl)
    const result = await sql_client.unsafe(sql)
    return new Response(JSON.stringify({ result }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
