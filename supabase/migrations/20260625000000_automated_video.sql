-- Create video_queue table
CREATE TABLE IF NOT EXISTS public.video_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    video_url TEXT,
    caption TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
    recipe_id UUID REFERENCES public.recipes(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Set up RLS for video_queue
ALTER TABLE public.video_queue ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read the queue (for visibility)
CREATE POLICY "Allow authenticated to read video queue"
ON public.video_queue
FOR SELECT
TO authenticated
USING (true);

-- Only service role or specific admins should be able to insert/update
-- For MVP, we'll allow all authenticated users to see it, but only service_role to manage
-- However, we might want a specific admin check later.
