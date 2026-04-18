-- Fix broken RLS policy on restaurants (self-join bug)
DROP POLICY IF EXISTS "Members can read their own restaurant" ON public.restaurants;
CREATE POLICY "Members can read their own restaurant"
ON public.restaurants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members rm
    WHERE rm.restaurant_id = restaurants.id
      AND rm.user_id = auth.uid()
  )
);