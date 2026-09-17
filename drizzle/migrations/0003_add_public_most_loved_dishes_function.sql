CREATE OR REPLACE FUNCTION public.get_most_loved_dish_ids(_restaurant_id uuid)
RETURNS TABLE(dish_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH favorite_counts AS (
    SELECT d.id AS dish_id, count(*)::bigint AS favorite_count
    FROM public.dishes d
    JOIN public.restaurants r ON r.id = d.restaurant_id
    JOIN public.dish_events e ON e.dish_id = d.id
    WHERE d.restaurant_id = _restaurant_id
      AND r.is_active = true
      AND d.is_available = true
      AND e.event_type = 'favorite'
    GROUP BY d.id
  ), ranked AS (
    SELECT dish_id,
           favorite_count,
           dense_rank() OVER (ORDER BY favorite_count DESC) AS favorite_rank
    FROM favorite_counts
  )
  SELECT ranked.dish_id
  FROM ranked
  WHERE ranked.favorite_rank = 1
    AND ranked.favorite_count > 0
$$;

REVOKE ALL ON FUNCTION public.get_most_loved_dish_ids(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_most_loved_dish_ids(uuid) TO anon, authenticated, service_role;