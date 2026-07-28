-- Base de RBAC (roles) pro painel administrativo do dono da aplicação.
--
-- Existia uma versão anterior deste sistema em migrations antigas do
-- repositório (20251005144801/144850/144909), NUNCA aplicada no banco real
-- (confirmado em 2026-07-28: a tabela user_roles não existe hoje em
-- produção). Essa versão antiga tinha uma falha séria: a função
-- initialize_first_admin(p_user_id) não tinha NENHUM grant restrito (então,
-- por padrão do Postgres, qualquer usuário autenticado — ou até anônimo —
-- poderia executá-la) e não conferia se auth.uid() = p_user_id, então
-- qualquer cliente poderia ter se auto-promovido a admin antes do dono real.
-- Mesma categoria de falha do incidente real com start_subscription
-- (2026-07-26), desta vez pega ANTES de ir pro ar.
--
-- Esta versão corrige isso removendo completamente essa função de bootstrap.
-- O primeiro (e por ora único) admin é inserido manualmente, uma única vez,
-- direto no SQL Editor do Supabase — nunca através de nenhuma rota do app.

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role é intencionalmente legível por qualquer usuário autenticado (só
-- retorna true/false, nunca dados) — é chamada de dentro das próprias
-- policies de RLS abaixo, então authenticated precisa de EXECUTE pra essas
-- policies funcionarem.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Usuário vê apenas seus próprios papéis" ON public.user_roles;
CREATE POLICY "Usuário vê apenas seus próprios papéis"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin vê todos os papéis" ON public.user_roles;
CREATE POLICY "Admin vê todos os papéis"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- INSERT/DELETE só funcionam se quem chama JÁ é admin — nenhum caminho de
-- auto-promoção. O primeiro admin não passa por aqui (INSERT direto via
-- SQL Editor, que roda como postgres/service_role e ignora RLS).
DROP POLICY IF EXISTS "Só admin concede papéis" ON public.user_roles;
CREATE POLICY "Só admin concede papéis"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Só admin revoga papéis" ON public.user_roles;
CREATE POLICY "Só admin revoga papéis"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.user_roles FROM PUBLIC;
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Métricas agregadas do painel do dono. SECURITY DEFINER pra poder ler
-- auth.users (contagem de cadastros) e todas as linhas de user_subscriptions
-- (RLS normal só deixa cada usuário ver a própria) — mas a PRIMEIRA coisa
-- que a função faz é conferir se quem chamou é admin; se não for, nem chega
-- a rodar a query, só devolve erro. Nunca expõe e-mail/nome/CPF individual
-- de cliente, só contagens e somas agregadas.
CREATE OR REPLACE FUNCTION public.admin_get_overview_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_users integer;
  v_new_signups_30d integer;
  v_active_by_plan jsonb;
  v_mrr_cents numeric;
  v_cancellations_30d integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT count(*) INTO v_total_users FROM auth.users;

  SELECT count(*) INTO v_new_signups_30d
  FROM auth.users
  WHERE created_at > now() - interval '30 days';

  SELECT jsonb_object_agg(plan_type, plan_count) INTO v_active_by_plan
  FROM (
    SELECT plan_type::text AS plan_type, count(*) AS plan_count
    FROM public.user_subscriptions
    WHERE status = 'active'
    GROUP BY plan_type
  ) t;

  -- MRR estimado: mensal soma o preço cheio; anual divide por 12. Usa
  -- plan_amount_paid (preço de catálogo, populado desde 2026-07-28) — linhas
  -- antigas sem esse valor são ignoradas na soma (melhor subestimar que
  -- estimar errado).
  SELECT COALESCE(SUM(
    CASE
      WHEN billing_interval = 'year' THEN plan_amount_paid / 12.0
      ELSE plan_amount_paid
    END
  ), 0) INTO v_mrr_cents
  FROM public.user_subscriptions
  WHERE status = 'active' AND plan_amount_paid IS NOT NULL;

  SELECT count(*) INTO v_cancellations_30d
  FROM public.user_subscriptions
  WHERE status IN ('cancelled', 'refunded', 'disputed')
    AND updated_at > now() - interval '30 days';

  RETURN jsonb_build_object(
    'total_users', v_total_users,
    'new_signups_30d', v_new_signups_30d,
    'active_by_plan', COALESCE(v_active_by_plan, '{}'::jsonb),
    'mrr_cents', ROUND(v_mrr_cents),
    'cancellations_30d', v_cancellations_30d,
    'generated_at', now()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_overview_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_overview_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_overview_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_overview_stats() TO service_role;
