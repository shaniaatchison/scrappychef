-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Master Ingredients Table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  default_shelf_life_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Pantries Table (Inventory)
CREATE TABLE IF NOT EXISTS public.user_pantries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE,
  custom_name TEXT, -- Fallback if not in master list
  quantity FLOAT DEFAULT 1,
  unit TEXT,
  expiration_date DATE,
  date_logged TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_rescued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Recipes Table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ingredients_json JSONB NOT NULL, -- List of required ingredients and quantities
  steps_json JSONB NOT NULL, -- Step-by-step instructions
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prep_time INTEGER, -- In minutes
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Saved Statistics Table
CREATE TABLE IF NOT EXISTS public.saved_statistics (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_money_saved FLOAT DEFAULT 0,
  total_lbs_waste_avoided FLOAT DEFAULT 0,
  recipes_cooked_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AI Generations Log Table
CREATE TABLE IF NOT EXISTS public.ai_generations_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ingredients_used JSONB NOT NULL,
  generated_recipe_id UUID REFERENCES public.recipes(id)
);

-- --- Row Level Security (RLS) ---

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pantries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Ingredients: Everyone can view, only admins (service_role) can modify
CREATE POLICY "Everyone can view ingredients" ON public.ingredients FOR SELECT USING (true);

-- User Pantries: Users can manage their own pantry
CREATE POLICY "Users can manage own pantry" ON public.user_pantries FOR ALL USING (auth.uid() = user_id);

-- Recipes: Everyone can view recipes
CREATE POLICY "Everyone can view recipes" ON public.recipes FOR SELECT USING (true);

-- Saved Statistics: Users can view and update their own stats
CREATE POLICY "Users can view own stats" ON public.saved_statistics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.saved_statistics FOR UPDATE USING (auth.uid() = user_id);

-- AI Generations Log: Users can view their own logs
CREATE POLICY "Users can view own AI logs" ON public.ai_generations_log FOR SELECT USING (auth.uid() = user_id);

-- --- Triggers ---

-- Trigger to create a profile and statistics entry on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.saved_statistics (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
