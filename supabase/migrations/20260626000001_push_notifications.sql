-- Table to store Web Push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own subscriptions" 
  ON public.push_subscriptions FOR ALL 
  USING (auth.uid() = user_id);

-- Add cron job for daily expiring soon checks
-- Schedule at 9:00 AM every day
-- Note: Replace [YOUR_SUPABASE_SERVICE_ROLE_KEY] with the actual key
SELECT cron.schedule(
    'check-expiring-items-daily',
    '0 9 * * *',
    $$
    SELECT net.http_post(
        url := 'https://iynmkpdqvbyrrdbvqrra.supabase.co/functions/v1/check-expiring-items',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || '[YOUR_SUPABASE_SERVICE_ROLE_KEY]'
        ),
        body := '{}'::jsonb
    );
    $$
);
