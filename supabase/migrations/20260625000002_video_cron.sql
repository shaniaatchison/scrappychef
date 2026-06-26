-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the process-video-queue function to run every 10 minutes
-- Note: Replace SERVICE_ROLE_KEY_PLACEHOLDER with the actual key
SELECT cron.schedule(
    'process-social-video-queue',
    '*/10 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://iynmkpdqvbyrrdbvqrra.supabase.co/functions/v1/process-video-queue',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || 'SERVICE_ROLE_KEY_PLACEHOLDER'
        ),
        body := '{}'::jsonb
    );
    $$
);
