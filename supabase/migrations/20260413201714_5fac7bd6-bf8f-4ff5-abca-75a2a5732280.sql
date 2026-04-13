ALTER TABLE public.site_settings
ADD COLUMN formulas jsonb NOT NULL DEFAULT '[]'::jsonb;