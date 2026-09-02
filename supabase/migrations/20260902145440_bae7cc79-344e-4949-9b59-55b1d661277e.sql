ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS custom_font_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS custom_font_url text NOT NULL DEFAULT '';