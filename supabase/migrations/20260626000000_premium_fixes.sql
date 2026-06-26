-- Combine Stripe columns and signup trigger fix
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Use built-in gen_random_uuid() to avoid uuid-ossp extension issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate a random 5-char alphanumeric code prefixed with SCRAPPY
  new_referral_code := 'SCRAPPY' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 5));

  INSERT INTO public.profiles (id, email, username, avatar_url, referral_code)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url', new_referral_code);
  
  -- Use UPSERT-like logic to avoid double insert errors
  INSERT INTO public.saved_statistics (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill any users missing referral codes
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    UPDATE public.profiles 
    SET referral_code = 'SCRAPPY' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 5))
    WHERE id = r.id;
  END LOOP;
END;
$$;
