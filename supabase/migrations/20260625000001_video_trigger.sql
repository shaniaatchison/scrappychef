-- Enable the pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger the video rendering
CREATE OR REPLACE FUNCTION public.trigger_video_render()
RETURNS TRIGGER AS $$
DECLARE
    recipe_record record;
    ingredients_list text[];
BEGIN
    -- Fetch the recipe details
    SELECT * INTO recipe_record FROM public.recipes WHERE id = NEW.recipe_id;
    
    -- Extract ingredient names from JSONB
    -- Assuming ingredients_json is an array of objects with a 'name' field
    SELECT array_agg(name) INTO ingredients_list 
    FROM (
        SELECT (jsonb_array_elements(recipe_record.ingredients_json)->>'name') as name
    ) s;

    -- Call the Edge Function
    -- Note: We use the SUPABASE_URL placeholder which will be replaced by the user
    PERFORM net.http_post(
        url := 'https://iynmkpdqvbyrrdbvqrra.supabase.co/functions/v1/trigger-video-render',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || '[YOUR_SUPABASE_SERVICE_ROLE_KEY]'
        ),
        body := jsonb_build_object(
            'video_id', NEW.id,
            'title', recipe_record.title,
            'ingredients', ingredients_list,
            'instructions', recipe_record.description
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on insert into video_queue
DROP TRIGGER IF EXISTS trigger_render_on_insert ON public.video_queue;
CREATE TRIGGER trigger_render_on_insert
AFTER INSERT ON public.video_queue
FOR EACH ROW
EXECUTE FUNCTION public.trigger_video_render();
