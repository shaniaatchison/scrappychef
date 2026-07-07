-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the auto-generate-video-content function to run once a day at 10:00 AM UTC
-- Note: Replace [YOUR_SUPABASE_SERVICE_ROLE_KEY] with the actual key
SELECT cron.schedule(
    'auto-generate-video-content-job',
    '0 10 * * *',
    $$
    SELECT net.http_post(
        url := 'https://iynmkpdqvbyrrdbvqrra.supabase.co/functions/v1/auto-generate-video-content',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || '[YOUR_SUPABASE_SERVICE_ROLE_KEY]'
        ),
        body := '{}'::jsonb
    );
    $$
);
