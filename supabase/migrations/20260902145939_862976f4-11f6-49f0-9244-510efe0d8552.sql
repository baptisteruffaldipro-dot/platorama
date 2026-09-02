ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS custom_font_name_2 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS custom_font_url_2 text NOT NULL DEFAULT '';