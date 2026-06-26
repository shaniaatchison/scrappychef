-- Add premium features columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_generation_count INTEGER DEFAULT 0;

-- Ensure RLS is still correct (should be fine as it's 'auth.uid() = id')
