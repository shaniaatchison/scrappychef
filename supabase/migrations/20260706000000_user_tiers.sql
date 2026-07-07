-- User Tiers & Usage Tracking
-- Run this in Supabase Dashboard SQL Editor

-- 1. Add tier and scan tracking columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'core', 'pro', 'lifetime')),
ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scan_limit INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS scan_month TEXT, -- YYYY-MM format for monthly reset
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE;

-- 2. Function to check and reset scan count monthly
CREATE OR REPLACE FUNCTION public.check_scan_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_month TEXT;
  user_tier TEXT;
  max_scans INTEGER;
BEGIN
  current_month := to_char(NOW(), 'YYYY-MM');
  user_tier := COALESC(NEW.tier, 'free');
  
  -- Determine scan limit based on tier
  CASE user_tier
    WHEN 'free' THEN max_scans := 15;
    WHEN 'core' THEN max_scans := 15;
    WHEN 'pro' THEN max_scans := 999999;
    WHEN 'lifetime' THEN max_scans := 999999;
    ELSE max_scans := 15;
  END CASE;
  
  -- Reset count if new month
  IF NEW.scan_month IS NULL OR NEW.scan_month != current_month THEN
    NEW.scan_count := 0;
    NEW.scan_month := current_month;
  END IF;
  
  -- Check limit
  IF NEW.scan_count >= max_scans THEN
    RAISE EXCEPTION 'SCAN_LIMIT_REACHED'
      USING HINT = 'Upgrade to Pro for unlimited scans';
  END IF;
  
  NEW.scan_count := NEW.scan_count + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger on profile update
DROP TRIGGER IF EXISTS check_scan_limit_on_scan ON public.profiles;
CREATE TRIGGER check_scan_limit_on_scan
BEFORE UPDATE OF scan_count ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_scan_limit();

-- 4. Add ingredients category column for shopping lists
ALTER TABLE public.ingredients
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other'
  CHECK (category IN ('produce', 'dairy', 'meat', 'pantry', 'spices', 'frozen', 'other'));

-- 5. Update existing ingredients with categories
UPDATE public.ingredients SET category = 'produce' WHERE category = 'other' AND name IN (
  'carrot', 'broccoli', 'spinach', 'lettuce', 'tomato', 'onion', 'garlic', 'bell pepper',
  'zucchini', 'eggplant', 'celery', 'kale', 'cucumber', 'avocado', 'mushroom', 'cabbage',
  'cauliflower', 'green beans', 'peas', 'corn', 'potato', 'sweet potato', 'lemon', 'lime',
  'banana', 'apple', 'orange', 'berries', 'grapes', 'watermelon', 'herbs', 'parsley',
  'cilantro', 'basil', 'mint', 'rosemary', 'thyme'
);
UPDATE public.ingredients SET category = 'dairy' WHERE category = 'other' AND name IN (
  'milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cream cheese', 'eggs',
  'parmesan', 'mozzarella', 'cheddar', 'feta', 'ricotta', 'half and half'
);
UPDATE public.ingredients SET category = 'meat' WHERE category = 'other' AND name IN (
  'chicken', 'beef', 'pork', 'fish', 'shrimp', 'turkey', 'bacon', 'sausage', 'tofu',
  'salmon', 'tuna', 'ground beef', 'chicken breast', 'steak'
);
UPDATE public.ingredients SET category = 'pantry' WHERE category = 'other' AND name IN (
  'rice', 'pasta', 'bread', 'flour', 'sugar', 'salt', 'oil', 'vinegar', 'soy sauce',
  'olive oil', 'cooking oil', 'honey', 'maple syrup', 'peanut butter', 'jam', 'cereal',
  'oatmeal', 'crackers', 'chips', 'nuts', 'seeds', 'dried fruit', 'canned tomatoes',
  'canned beans', 'broth', 'stock', 'coconut milk'
);
UPDATE public.ingredients SET category = 'spices' WHERE category = 'other' AND name IN (
  'salt', 'pepper', 'paprika', 'cumin', 'turmeric', 'cinnamon', 'oregano', 'bay leaves',
  'chili powder', 'garlic powder', 'onion powder', 'italian seasoning'
);
UPDATE public.ingredients SET category = 'frozen' WHERE category = 'other' AND name IN (
  'frozen vegetables', 'frozen fruit', 'ice cream', 'frozen pizza', 'frozen berries'
);