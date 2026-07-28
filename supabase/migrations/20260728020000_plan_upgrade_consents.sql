-- Registro auditável do aceite do upgrade de plano — mesmo problema que
-- terms_acceptances resolveu pro cadastro: o checkbox "Ao confirmar, você
-- concorda com a cobrança de R$X..." no UpgradeQuoteDialog só existia no
-- estado do componente React, nunca era enviado nem gravado no servidor.
-- Sem isso, não há como comprovar que o cliente concordou com o valor
-- específico cobrado se ele contestar a cobrança depois.

CREATE TABLE IF NOT EXISTS public.plan_upgrade_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_plan_type text NOT NULL,
  previous_billing_interval text NOT NULL,
  new_plan_type text NOT NULL,
  new_billing_interval text NOT NULL,
  credit_cents integer NOT NULL,
  new_price_cents integer NOT NULL,
  charge_now_cents integer NOT NULL,
  checkout_external_id text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plan_upgrade_consents_user_id_idx ON public.plan_upgrade_consents(user_id);

ALTER TABLE public.plan_upgrade_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê apenas seus próprios aceites de upgrade"
  ON public.plan_upgrade_consents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Sem policy de INSERT/UPDATE/DELETE pra authenticated — só a edge function
-- (via service_role) grava aqui, no momento exato em que cria o checkout,
-- logo depois do clique em "Confirmar upgrade" com o checkbox marcado.
REVOKE INSERT, UPDATE, DELETE ON public.plan_upgrade_consents FROM authenticated;
REVOKE ALL ON public.plan_upgrade_consents FROM anon;
GRANT SELECT ON public.plan_upgrade_consents TO authenticated;
GRANT ALL ON public.plan_upgrade_consents TO service_role;
