CREATE TABLE public.restaurant_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL UNIQUE REFERENCES public.restaurants(id) ON DELETE CASCADE,
  reviews_enabled boolean NOT NULL DEFAULT false,
  google_review_url text,
  reviews_threshold smallint NOT NULL DEFAULT 4,
  reviews_prompt text,
  loyalty_enabled boolean NOT NULL DEFAULT false,
  popups_enabled boolean NOT NULL DEFAULT false,
  daily_menu_enabled boolean NOT NULL DEFAULT false,
  allergens_enabled boolean NOT NULL DEFAULT false,
  diet_profiles_enabled boolean NOT NULL DEFAULT false,
  pick_for_me_enabled boolean NOT NULL DEFAULT false,
  top_dishes_enabled boolean NOT NULL DEFAULT false,
  trending_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.restaurant_features TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_features TO authenticated;
GRANT ALL ON public.restaurant_features TO service_role;

ALTER TABLE public.restaurant_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Features are publicly readable"
  ON public.restaurant_features FOR SELECT
  USING (true);

CREATE POLICY "Team can insert features"
  ON public.restaurant_features FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Team can update features"
  ON public.restaurant_features FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Team can delete features"
  ON public.restaurant_features FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  rating smallint NOT NULL,
  comment text,
  first_name text,
  email text,
  phone text,
  lang text,
  redirected_to_google boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reviews_restaurant_created_idx ON public.reviews (restaurant_id, created_at DESC);

GRANT INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can leave a review"
  ON public.reviews FOR INSERT
  WITH CHECK (rating BETWEEN 1 AND 5);

CREATE POLICY "Team can read reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Team can update reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Team can delete reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE TRIGGER update_restaurant_features_updated_at
  BEFORE UPDATE ON public.restaurant_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();