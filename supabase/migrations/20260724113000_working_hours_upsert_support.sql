-- Permite upsert em working_hours: o front-end só sabia fazer UPDATE por id,
-- então usuários novos (sem nenhuma linha ainda) nunca conseguiam salvar o
-- primeiro horário de trabalho (falhava silenciosamente / com erro).
--
-- Migration 20260724112836 já cria essa mesma constraint com o mesmo nome
-- (duplicidade acidental). Guardado com DO/EXCEPTION para não quebrar caso
-- as duas rodem no mesmo ambiente, em qualquer ordem.
DO $$
BEGIN
  ALTER TABLE public.working_hours
    ADD CONSTRAINT working_hours_user_day_unique UNIQUE (user_id, day_of_week);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
