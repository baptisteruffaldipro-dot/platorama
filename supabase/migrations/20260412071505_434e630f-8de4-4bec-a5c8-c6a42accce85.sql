
ALTER TABLE public.dishes ADD COLUMN allergens text[] NOT NULL DEFAULT '{}';
