ALTER TABLE public.site_settings
  ADD COLUMN disclaimer_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN disclaimer_mode text NOT NULL DEFAULT 'footer',
  ADD COLUMN disclaimer_text text NOT NULL DEFAULT '';