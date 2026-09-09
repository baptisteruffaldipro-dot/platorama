CREATE TABLE public.daily_menus (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  menu_date date NOT NULL DEFAULT (now()::date),
  title text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  formula_label text NOT NULL DEFAULT '',
  formula_price numeric,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_square text NOT NULL DEFAULT '',
  image_story text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, menu_date)
);

GRANT SELECT ON public.daily_menus TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_menus TO authenticated;
GRANT ALL ON public.daily_menus TO service_role;

ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published daily menus"
ON public.daily_menus FOR SELECT
USING (
  is_published = true
  AND EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = daily_menus.restaurant_id AND r.is_active = true)
);

CREATE POLICY "Team can view their daily menus"
ON public.daily_menus FOR SELECT TO authenticated
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Team can insert their daily menus"
ON public.daily_menus FOR INSERT TO authenticated
WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Team can update their daily menus"
ON public.daily_menus FOR UPDATE TO authenticated
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Team can delete their daily menus"
ON public.daily_menus FOR DELETE TO authenticated
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_daily_menus_updated_at
BEFORE UPDATE ON public.daily_menus
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_daily_menus_resto_date ON public.daily_menus (restaurant_id, menu_date DESC);