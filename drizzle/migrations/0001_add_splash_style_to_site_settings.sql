ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS splash_style TEXT NOT NULL DEFAULT 'logo_text';