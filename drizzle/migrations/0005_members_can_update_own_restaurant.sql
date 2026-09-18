-- Members can update their own restaurant's contact information
CREATE POLICY "Members can update their own restaurant"
ON public.restaurants
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.restaurant_members rm
    WHERE rm.restaurant_id = restaurants.id
      AND rm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.restaurant_members rm
    WHERE rm.restaurant_id = restaurants.id
      AND rm.user_id = auth.uid()
  )
);