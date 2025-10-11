-- Remove a constraint UNIQUE de user_id para permitir histórico de assinaturas
-- A validação de apenas 1 assinatura ATIVA já está no trigger enforce_single_active_subscription
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_key;

-- Criar índice para performance (sem UNIQUE) para melhorar queries por user_id
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
ON public.user_subscriptions(user_id);

-- Criar índice composto para melhorar performance de queries de assinaturas ativas
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
ON public.user_subscriptions(user_id, status) 
WHERE status IN ('active', 'trial_active');