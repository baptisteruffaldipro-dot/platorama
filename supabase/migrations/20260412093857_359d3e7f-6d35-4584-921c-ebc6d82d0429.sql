
-- Drop the global unique constraint on sort_order
ALTER TABLE public.dishes DROP CONSTRAINT IF EXISTS dishes_sort_order_unique;
ALTER TABLE public.dishes DROP CONSTRAINT IF EXISTS dishes_sort_order_key;

-- Create a composite unique index scoped per restaurant
CREATE UNIQUE INDEX dishes_restaurant_sort_order_unique ON public.dishes (restaurant_id, sort_order);
