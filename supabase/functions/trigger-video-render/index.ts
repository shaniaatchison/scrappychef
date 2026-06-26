import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN')
const GITHUB_REPO = Deno.env.get('GITHUB_REPO') // e.g. "username/repo"

serve(async (req) => {
  try {
    const { video_id, title, ingredients, instructions } = await req.json()

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      throw new Error('GITHUB_TOKEN or GITHUB_REPO not set')
    }

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'render_video',
        client_payload: {
          video_id,
          title,
          ingredients,
          instructions,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GitHub API error: ${errorText}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
