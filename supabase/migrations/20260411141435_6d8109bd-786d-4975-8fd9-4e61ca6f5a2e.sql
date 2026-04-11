
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  background_color text NOT NULL DEFAULT '#0d0d0d',
  text_color text NOT NULL DEFAULT '#ece5d5',
  heading_font text NOT NULL DEFAULT 'Cormorant Garamond',
  body_font text NOT NULL DEFAULT 'Cormorant Garamond',
  button_bg_color text NOT NULL DEFAULT '#b8943e',
  button_text_color text NOT NULL DEFAULT '#ece5d5',
  logo_url text NOT NULL DEFAULT '',
  is_draft boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read published settings
CREATE POLICY "Anyone can read published settings"
  ON public.site_settings FOR SELECT
  USING (is_draft = false);

-- Admins can read all settings (including drafts)
CREATE POLICY "Admins can read all settings"
  ON public.site_settings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins can insert
CREATE POLICY "Admins can insert settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update
CREATE POLICY "Admins can update settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
