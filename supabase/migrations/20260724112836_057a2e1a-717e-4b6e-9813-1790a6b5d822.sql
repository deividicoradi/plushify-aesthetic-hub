ALTER TABLE public.working_hours
  ADD CONSTRAINT working_hours_user_day_unique UNIQUE (user_id, day_of_week);