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

REVOKE ALL ON public.plan_upgrade_consents FROM anon;
GRANT SELECT ON public.plan_upgrade_consents TO authenticated;
GRANT ALL ON public.plan_upgrade_consents TO service_role;

ALTER TABLE public.plan_upgrade_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê apenas seus próprios aceites de upgrade"
  ON public.plan_upgrade_consents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);