ALTER TABLE public.restaurants
  ADD COLUMN contact_email text DEFAULT '',
  ADD COLUMN address text DEFAULT '',
  ADD COLUMN phone text DEFAULT '',
  ADD COLUMN website text DEFAULT '';