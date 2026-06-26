-- Viral Loop Schema Updates
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES public.profiles(id);

ALTER TABLE public.saved_statistics
ADD COLUMN IF NOT EXISTS consecutive_days_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scrappy_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_logged_date DATE;

-- Update handle_new_user to generate referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate a random 5-char alphanumeric code prefixed with SCRAPPY
  new_referral_code := 'SCRAPPY' || upper(substring(replace(uuid_generate_v4()::text, '-', '') from 1 for 5));

  INSERT INTO public.profiles (id, email, username, avatar_url, referral_code)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url', new_referral_code);
  
  INSERT INTO public.saved_statistics (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users with referral codes if they don't have one
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    UPDATE public.profiles 
    SET referral_code = 'SCRAPPY' || upper(substring(replace(uuid_generate_v4()::text, '-', '') from 1 for 5))
    WHERE id = r.id;
  END LOOP;
END;
$$;
