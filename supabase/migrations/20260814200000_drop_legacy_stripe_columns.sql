-- Colunas stripe_customer_id/stripe_subscription_id em user_subscriptions
-- são resíduo da integração antiga com Stripe (substituída por
-- AbacatePay). Confirmado: zero referência em src/, zero função RPC
-- atual as lê/escreve (a função start_subscription atual usa
-- p_abacate_customer_id/p_abacate_subscription_id desde a migração
-- 20260713005303, que adicionou as colunas abacate_* ao lado sem nunca
-- renomear ou remover as antigas). O índice único parcial sobre
-- stripe_subscription_id (migração 20251009233810) também é removido
-- por depender da coluna.
DROP INDEX IF EXISTS public.idx_stripe_subscription;

ALTER TABLE public.user_subscriptions
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id;
