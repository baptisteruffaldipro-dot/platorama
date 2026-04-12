
-- 1. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_dishes INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subscriptions"
  ON public.subscriptions FOR SELECT USING (true);

CREATE POLICY "Super admins can manage subscriptions"
  ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 2. Create restaurants table (no member-referencing policies yet)
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can do everything on restaurants"
  ON public.restaurants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can read active restaurants"
  ON public.restaurants FOR SELECT USING (is_active = true);

-- 3. Create restaurant_members table
CREATE TABLE IF NOT EXISTS public.restaurant_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

ALTER TABLE public.restaurant_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage members"
  ON public.restaurant_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Members can read their own membership"
  ON public.restaurant_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4. Now add member-based policy on restaurants
CREATE POLICY "Members can read their own restaurant"
  ON public.restaurants FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurant_members rm
      WHERE rm.restaurant_id = id AND rm.user_id = auth.uid()
    )
  );

-- 5. Add restaurant_id to dishes and site_settings
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- 6. Update RLS on dishes
DROP POLICY IF EXISTS "Anyone can read dishes" ON public.dishes;
DROP POLICY IF EXISTS "Admins can insert dishes" ON public.dishes;
DROP POLICY IF EXISTS "Admins can update dishes" ON public.dishes;
DROP POLICY IF EXISTS "Admins can delete dishes" ON public.dishes;

CREATE POLICY "Anyone can read dishes" ON public.dishes FOR SELECT USING (true);

CREATE POLICY "Super admins can manage all dishes"
  ON public.dishes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Restaurant owners can manage their dishes"
  ON public.dishes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurant_members rm
      WHERE rm.restaurant_id = dishes.restaurant_id AND rm.user_id = auth.uid()
    )
  );

-- 7. Update RLS on site_settings
DROP POLICY IF EXISTS "Anyone can read published settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can read all settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON public.site_settings;

CREATE POLICY "Anyone can read published settings"
  ON public.site_settings FOR SELECT USING (is_draft = false);

CREATE POLICY "Super admins can manage all settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Restaurant owners can manage their settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurant_members rm
      WHERE rm.restaurant_id = site_settings.restaurant_id AND rm.user_id = auth.uid()
    )
  );

-- 8. Helper function
CREATE OR REPLACE FUNCTION public.get_user_restaurant_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT restaurant_id FROM public.restaurant_members WHERE user_id = _user_id LIMIT 1
$$;

-- 9. Trigger
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Seed subscriptions
INSERT INTO public.subscriptions (name, slug, price_monthly, max_dishes, sort_order, features) VALUES
  ('Starter', 'starter', 29, 10, 1, '["Menu virtuel", "10 plats max", "Branding basique"]'::jsonb),
  ('Pro', 'pro', 59, 30, 2, '["Menu virtuel", "30 plats max", "Branding complet", "Statistiques"]'::jsonb),
  ('Premium', 'premium', 99, 100, 3, '["Menu virtuel", "100 plats max", "Branding complet", "Statistiques avancées", "Support prioritaire"]'::jsonb);
