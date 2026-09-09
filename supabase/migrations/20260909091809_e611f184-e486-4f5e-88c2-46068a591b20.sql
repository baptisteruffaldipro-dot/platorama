ALTER TABLE public.dish_events DROP CONSTRAINT dish_events_event_type_check;
ALTER TABLE public.dish_events ADD CONSTRAINT dish_events_event_type_check
  CHECK (event_type = ANY (ARRAY['favorite','ar_click','view','ar_blocked_inapp'])
         OR event_type ~ '^view_duration_[0-9]+$');