-- Bug real reportado pelo usuário: "Assinaturas ativas por plano" no admin
-- só sobe, nunca reflete usuários deletados (Trial marcando 13, Premium 4,
-- com só 5 usuários totais na base).
--
-- Causa raiz confirmada por diagnóstico direto no banco: public.user_subscriptions
-- tinha `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE` desde a
-- migration original (20250615034638), mas uma migration de 2026-06-08 que
-- parece um dump/baseline de schema (20260608174652) recriou a tabela com
-- `user_id uuid NOT NULL UNIQUE` — SEM nenhuma referência a auth.users.
-- Nenhuma migration posterior recolocou a FK. Resultado: deletar uma conta
-- em auth.users nunca removia a assinatura correspondente, e ela continuava
-- contando pra sempre em admin_get_overview_stats() (13 linhas órfãs
-- confirmadas: 12 trial/active + 1 premium/active).

-- 1. Limpa as linhas órfãs que já existem (assinaturas de contas que não
--    existem mais em auth.users).
DELETE FROM public.user_subscriptions s
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.user_id);

-- 2. Restaura a integridade referencial com cascade, pra isso nunca mais
--    acontecer daqui pra frente. DO block torna seguro rodar de novo.
DO $$ BEGIN
  ALTER TABLE public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
