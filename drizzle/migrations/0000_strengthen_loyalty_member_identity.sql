ALTER TABLE public.loyalty_members
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS email_normalized text,
  ADD COLUMN IF NOT EXISTS phone_normalized text;

UPDATE public.loyalty_members
SET
  email_normalized = CASE
    WHEN email IS NULL OR btrim(email) = '' THEN NULL
    ELSE lower(btrim(email))
  END,
  phone_normalized = CASE
    WHEN phone IS NULL OR btrim(phone) = '' THEN NULL
    ELSE regexp_replace(phone, '[^0-9+]', '', 'g')
  END
WHERE email_normalized IS NULL OR phone_normalized IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_members_restaurant_email_normalized_key
  ON public.loyalty_members (restaurant_id, email_normalized)
  WHERE email_normalized IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_members_restaurant_phone_normalized_key
  ON public.loyalty_members (restaurant_id, phone_normalized)
  WHERE phone_normalized IS NOT NULL;