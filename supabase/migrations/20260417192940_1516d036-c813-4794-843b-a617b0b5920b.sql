-- Enable unaccent first
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;

-- Slug helper
CREATE OR REPLACE FUNCTION public.slugify(_input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(public.unaccent(_input)),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-{2,}', '-', 'g'
    )
  );
$$;

-- Backfill slugs that are empty or look like UUIDs
UPDATE public.restaurants r
SET slug = base.candidate
FROM (
  SELECT
    id,
    CASE
      WHEN cnt = 1 THEN candidate
      ELSE candidate || '-' || substr(id::text, 1, 4)
    END AS candidate
  FROM (
    SELECT
      id,
      public.slugify(name) AS candidate,
      COUNT(*) OVER (PARTITION BY public.slugify(name)) AS cnt
    FROM public.restaurants
    WHERE slug ~ '^[0-9a-f]{8}-' OR slug = '' OR slug IS NULL
  ) s
) base
WHERE r.id = base.id;

-- Unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS restaurants_slug_unique ON public.restaurants(slug);