-- Réglages fidélité par restaurant
ALTER TABLE public.restaurant_features
  ADD COLUMN IF NOT EXISTS loyalty_points_per_visit integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS loyalty_reward_threshold integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS loyalty_welcome_text text,
  ADD COLUMN IF NOT EXISTS loyalty_program_name text;

-- Membres de fidélité (compte léger, sans mot de passe)
CREATE TABLE IF NOT EXISTS public.loyalty_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  first_name text,
  email text,
  phone text,
  card_code text NOT NULL,
  access_token uuid NOT NULL DEFAULT gen_random_uuid(),
  points integer NOT NULL DEFAULT 0,
  visits integer NOT NULL DEFAULT 0,
  consent_email boolean NOT NULL DEFAULT false,
  consent_sms boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  unsubscribed_at timestamptz,
  lang text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS loyalty_members_card_code_key ON public.loyalty_members (card_code);
CREATE UNIQUE INDEX IF NOT EXISTS loyalty_members_token_key ON public.loyalty_members (access_token);
CREATE INDEX IF NOT EXISTS loyalty_members_resto_idx ON public.loyalty_members (restaurant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_members TO authenticated;
GRANT ALL ON public.loyalty_members TO service_role;
ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team reads its loyalty members"
  ON public.loyalty_members FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()));
CREATE POLICY "Team updates its loyalty members"
  ON public.loyalty_members FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()));
CREATE POLICY "Team deletes its loyalty members"
  ON public.loyalty_members FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()));

-- Récompenses proposées
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text,
  points_cost integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS loyalty_rewards_resto_idx ON public.loyalty_rewards (restaurant_id);

GRANT SELECT ON public.loyalty_rewards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_rewards TO authenticated;
GRANT ALL ON public.loyalty_rewards TO service_role;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active rewards"
  ON public.loyalty_rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Team manages its rewards"
  ON public.loyalty_rewards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()));

-- Historique des points
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.loyalty_members(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'earn',
  points integer NOT NULL,
  label text,
  reward_id uuid REFERENCES public.loyalty_rewards(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS loyalty_tx_member_idx ON public.loyalty_transactions (member_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.loyalty_transactions TO authenticated;
GRANT ALL ON public.loyalty_transactions TO service_role;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team reads its loyalty history"
  ON public.loyalty_transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()));
CREATE POLICY "Team writes its loyalty history"
  ON public.loyalty_transactions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()));

-- Historique de consentement (RGPD)
CREATE TABLE IF NOT EXISTS public.consent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.loyalty_members(id) ON DELETE CASCADE,
  email text,
  phone text,
  channel text NOT NULL,
  granted boolean NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS consent_events_resto_idx ON public.consent_events (restaurant_id, created_at DESC);

GRANT SELECT ON public.consent_events TO authenticated;
GRANT ALL ON public.consent_events TO service_role;
ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team reads its consent history"
  ON public.consent_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()));