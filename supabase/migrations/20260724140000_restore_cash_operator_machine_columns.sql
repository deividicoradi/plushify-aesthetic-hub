-- cash_openings e cash_closures perderam as colunas operator_id/machine_id
-- (adicionadas em 20250906133947, mas ausentes na recriação das tabelas em
-- 20260608174652) — todo insert de abertura/fechamento de caixa vinha
-- falhando com 400 "Could not find the 'machine_id' column".
ALTER TABLE public.cash_openings
  ADD COLUMN IF NOT EXISTS operator_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS machine_id text;

ALTER TABLE public.cash_closures
  ADD COLUMN IF NOT EXISTS operator_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS machine_id text;
