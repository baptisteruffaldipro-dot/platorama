CREATE TABLE public.popups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_url text NOT NULL DEFAULT '',
  starts_at timestamptz,
  ends_at timestamptz,
  frequency text NOT NULL DEFAULT 'once_per_day',
  target_lang text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT popups_frequency_check CHECK (frequency IN ('always','once_per_session','once_per_day','once_ever'))
);

GRANT SELECT ON public.popups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.popups TO authenticated;
GRANT ALL ON public.popups TO service_role;

ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active popups" ON public.popups
  FOR SELECT USING (is_active = true);

CREATE POLICY "Team can read their popups" ON public.popups
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Team can insert popups" ON public.popups
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Team can update popups" ON public.popups
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Team can delete popups" ON public.popups
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE TRIGGER update_popups_updated_at BEFORE UPDATE ON public.popups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.popup_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  popup_id uuid NOT NULL REFERENCES public.popups(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT popup_events_type_check CHECK (event_type IN ('impression','click','dismiss'))
);

CREATE INDEX popup_events_popup_idx ON public.popup_events (popup_id, event_type);
CREATE INDEX popups_restaurant_idx ON public.popups (restaurant_id);

GRANT INSERT ON public.popup_events TO anon;
GRANT SELECT, INSERT ON public.popup_events TO authenticated;
GRANT ALL ON public.popup_events TO service_role;

ALTER TABLE public.popup_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert popup events" ON public.popup_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Team can read popup events" ON public.popup_events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.popups p
    WHERE p.id = popup_events.popup_id
      AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR p.restaurant_id = public.get_user_restaurant_id(auth.uid()))
  ));