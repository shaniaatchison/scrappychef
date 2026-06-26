import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const AYRSHARE_API_KEY = Deno.env.get('AYRSHARE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const supabase = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    // 0. Ensure storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets?.find((b) => b.name === 'generated_videos')) {
      const { error: bucketError } = await supabase.storage.createBucket('generated_videos', {
        public: true,
      })
      if (bucketError) console.error('Error creating bucket:', bucketError)
      else console.log('Created bucket: generated_videos')
    }

    // 1. Fetch pending videos
    const { data: queue, error: queueError } = await supabase
      .from('video_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(5)

    if (queueError) throw queueError

    const results = []

    for (const item of queue) {
      console.log(`Processing video for item: ${item.id}`)
      
      // Note: Actual rendering happens outside this function (e.g. GitHub Action)
      // This function triggers the social posting once video_url is present.
      
      if (!item.video_url) {
        console.log(`Item ${item.id} has no video_url yet. Skipping.`)
        continue
      }

      // 2. Post to social media via Ayrshare
      if (AYRSHARE_API_KEY) {
        const response = await fetch('https://app.ayrshare.com/api/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AYRSHARE_API_KEY}`
          },
          body: JSON.stringify({
            post: item.caption,
            mediaUrls: [item.video_url],
            platforms: ['tiktok', 'instagram', 'facebook'],
            is_aigc: true
          })
        })

        const resData = await response.json()
        
        if (resData.status === 'success') {
          await supabase
            .from('video_queue')
            .update({ status: 'published' })
            .eq('id', item.id)
          results.push({ id: item.id, status: 'published' })
        } else {
          console.error('Ayrshare error:', resData)
          await supabase
            .from('video_queue')
            .update({ status: 'failed', metadata: { error: resData } })
            .eq('id', item.id)
          results.push({ id: item.id, status: 'failed', error: resData })
        }
      } else {
        console.warn('AYRSHARE_API_KEY not set. Mocking success.')
        await supabase
          .from('video_queue')
          .update({ status: 'published' })
          .eq('id', item.id)
        results.push({ id: item.id, status: 'mock_published' })
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results }), {
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
