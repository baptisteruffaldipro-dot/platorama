-- CRM: médiathèque + campagnes email
ALTER TABLE public.restaurant_features
  ADD COLUMN IF NOT EXISTS crm_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS crm_sender_name text,
  ADD COLUMN IF NOT EXISTS crm_sender_email text;

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  url text NOT NULL,
  storage_path text,
  kind text NOT NULL DEFAULT 'image',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage their media" ON public.media_assets FOR ALL TO authenticated
  USING (restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'email' CHECK (channel IN ('email','sms')),
  name text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_url text NOT NULL DEFAULT '',
  target_lang text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sending','sent','failed')),
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage their campaigns" ON public.campaigns FOR ALL TO authenticated
  USING (restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.loyalty_members(id) ON DELETE SET NULL,
  email text,
  phone text,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','skipped')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaign_recipients TO authenticated;
GRANT ALL ON public.campaign_recipients TO service_role;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read their campaign recipients" ON public.campaign_recipients FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_id
      AND (c.restaurant_id = public.get_user_restaurant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
  ));