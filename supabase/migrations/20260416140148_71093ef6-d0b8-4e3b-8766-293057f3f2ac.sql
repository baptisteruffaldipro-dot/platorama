
-- Add new fields to dishes for Classic/Business/Premium features
ALTER TABLE public.dishes 
  ADD COLUMN IF NOT EXISTS prep_time integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS badge text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS time_slot text NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS story_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS story_image text NOT NULL DEFAULT '';

-- Add event types for view tracking (Business stats)
-- dish_events already exists, we just need to track 'view' and 'view_duration' events
-- No schema change needed for that.

COMMENT ON COLUMN public.dishes.prep_time IS 'Preparation time in minutes';
COMMENT ON COLUMN public.dishes.is_available IS 'Whether dish is currently available';
COMMENT ON COLUMN public.dishes.badge IS 'Visual badge: bestseller, coup_de_coeur, or null';
COMMENT ON COLUMN public.dishes.time_slot IS 'When dish is served: midi, soir, or both';
COMMENT ON COLUMN public.dishes.story_text IS 'Storytelling text for Premium tier';
COMMENT ON COLUMN public.dishes.story_image IS 'Storytelling image URL for Premium tier';
