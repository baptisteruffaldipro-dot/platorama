
CREATE TABLE public.dish_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('favorite', 'ar_click')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dish_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (anonymous visitors)
CREATE POLICY "Anyone can insert events"
ON public.dish_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read events
CREATE POLICY "Admins can read events"
ON public.dish_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast aggregation
CREATE INDEX idx_dish_events_dish_type ON public.dish_events (dish_id, event_type);
