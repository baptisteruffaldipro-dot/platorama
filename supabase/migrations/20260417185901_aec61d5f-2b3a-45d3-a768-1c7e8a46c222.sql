ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS template_id text NOT NULL DEFAULT 'dark-luxe';