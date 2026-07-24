-- Permite upsert em working_hours: o front-end só sabia fazer UPDATE por id,
-- então usuários novos (sem nenhuma linha ainda) nunca conseguiam salvar o
-- primeiro horário de trabalho (falhava silenciosamente / com erro).
ALTER TABLE public.working_hours
  ADD CONSTRAINT working_hours_user_day_unique UNIQUE (user_id, day_of_week);
