
-- =========================================================================
-- LOYALTY MODULE — per-establishment configuration
-- =========================================================================

-- 1) SETTINGS ---------------------------------------------------------------
CREATE TABLE public.loyalty_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  points_active boolean NOT NULL DEFAULT true,
  points_per_currency numeric NOT NULL DEFAULT 1,
  points_validity_days integer,
  vip_criteria jsonb NOT NULL DEFAULT '{"type":"all_active"}'::jsonb,
  how_it_works jsonb NOT NULL DEFAULT '[]'::jsonb,
  seeded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_settings TO authenticated;
GRANT ALL ON public.loyalty_settings TO service_role;
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own loyalty_settings" ON public.loyalty_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2) TIERS ------------------------------------------------------------------
CREATE TABLE public.loyalty_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  min_spent numeric NOT NULL DEFAULT 0,
  min_points integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#a16207',
  benefit text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.loyalty_tiers(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_tiers TO authenticated;
GRANT ALL ON public.loyalty_tiers TO service_role;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own loyalty_tiers" ON public.loyalty_tiers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3) CHALLENGES -------------------------------------------------------------
CREATE TABLE public.loyalty_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  goal_type text NOT NULL DEFAULT 'visits',
  target_value numeric NOT NULL DEFAULT 0,
  period_start date,
  period_end date,
  reward text,
  difficulty text NOT NULL DEFAULT 'easy',
  audience text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.loyalty_challenges(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_challenges TO authenticated;
GRANT ALL ON public.loyalty_challenges TO service_role;
ALTER TABLE public.loyalty_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own loyalty_challenges" ON public.loyalty_challenges
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) REWARDS ----------------------------------------------------------------
CREATE TABLE public.loyalty_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  points_cost integer NOT NULL DEFAULT 0,
  reward_type text NOT NULL DEFAULT 'discount',
  tier_name text,
  validity_days integer,
  popular boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.loyalty_rewards(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_rewards TO authenticated;
GRANT ALL ON public.loyalty_rewards TO service_role;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own loyalty_rewards" ON public.loyalty_rewards
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5) POINT TRANSACTIONS -----------------------------------------------------
CREATE TABLE public.loyalty_point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid,
  kind text NOT NULL DEFAULT 'earn',
  source text NOT NULL DEFAULT 'manual',
  points integer NOT NULL DEFAULT 0,
  description text,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.loyalty_point_transactions(user_id);
CREATE INDEX ON public.loyalty_point_transactions(user_id, client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_point_transactions TO authenticated;
GRANT ALL ON public.loyalty_point_transactions TO service_role;
ALTER TABLE public.loyalty_point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own loyalty_point_txn" ON public.loyalty_point_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6) REDEMPTIONS ------------------------------------------------------------
CREATE TABLE public.loyalty_reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid,
  reward_id uuid,
  reward_title text NOT NULL,
  points_used integer NOT NULL DEFAULT 0,
  estimated_value numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'delivered',
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.loyalty_reward_redemptions(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_reward_redemptions TO authenticated;
GRANT ALL ON public.loyalty_reward_redemptions TO service_role;
ALTER TABLE public.loyalty_reward_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own loyalty_redemptions" ON public.loyalty_reward_redemptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at triggers -------------------------------------------------------
CREATE TRIGGER trg_loyalty_settings_updated BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_loyalty_tiers_updated BEFORE UPDATE ON public.loyalty_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_loyalty_challenges_updated BEFORE UPDATE ON public.loyalty_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_loyalty_rewards_updated BEFORE UPDATE ON public.loyalty_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_loyalty_redemptions_updated BEFORE UPDATE ON public.loyalty_reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed defaults function ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_loyalty_defaults()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_settings public.loyalty_settings%ROWTYPE;
BEGIN
  IF v_user IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO v_settings FROM public.loyalty_settings WHERE user_id = v_user;

  IF NOT FOUND THEN
    INSERT INTO public.loyalty_settings (user_id, seeded, how_it_works)
    VALUES (
      v_user,
      true,
      '[
        {"id":"rule-1","icon":"dollar","title":"1 Real = 1 Ponto","description":"A cada R$ 1,00 gasto, o cliente ganha 1 ponto","active":true},
        {"id":"rule-2","icon":"calendar","title":"Automático","description":"Pontos creditados quando o agendamento é concluído","active":true},
        {"id":"rule-3","icon":"award","title":"Tiers Automáticos","description":"Bronze, Prata, Ouro e Diamante","active":true}
      ]'::jsonb
    );
  ELSIF v_settings.seeded THEN
    RETURN;
  ELSE
    UPDATE public.loyalty_settings SET seeded = true WHERE user_id = v_user;
  END IF;

  -- Tiers
  IF NOT EXISTS (SELECT 1 FROM public.loyalty_tiers WHERE user_id = v_user) THEN
    INSERT INTO public.loyalty_tiers (user_id, name, min_spent, min_points, color, benefit, description, sort_order) VALUES
      (v_user, 'Bronze',    0,    0,    '#a16207', 'Entrada no programa', 'Nível inicial', 1),
      (v_user, 'Prata',     500,  500,  '#9ca3af', '5% de desconto',      'Cliente recorrente', 2),
      (v_user, 'Ouro',      1000, 1000, '#eab308', '10% de desconto + brindes', 'Cliente fiel', 3),
      (v_user, 'Diamante',  2000, 2000, '#3b82f6', 'Benefícios exclusivos VIP', 'Cliente premium', 4);
  END IF;

  -- Challenges
  IF NOT EXISTS (SELECT 1 FROM public.loyalty_challenges WHERE user_id = v_user) THEN
    INSERT INTO public.loyalty_challenges (user_id, title, description, goal_type, target_value, reward, difficulty, audience, status) VALUES
      (v_user, 'Cliente Frequente', 'Realize 5 agendamentos este mês', 'visits',   5,   '50 pontos bônus',              'easy',   'all', 'active'),
      (v_user, 'Grande Investidor', 'Gaste R$ 500 em serviços',        'spending', 500, '100 pontos + desconto 10%',    'medium', 'all', 'active'),
      (v_user, 'Embaixador VIP',    'Indique 3 novos clientes',        'referral', 3,   '200 pontos + brinde especial', 'hard',   'all', 'active');
  END IF;

  -- Rewards
  IF NOT EXISTS (SELECT 1 FROM public.loyalty_rewards WHERE user_id = v_user) THEN
    INSERT INTO public.loyalty_rewards (user_id, title, description, points_cost, reward_type, tier_name, popular, available) VALUES
      (v_user, 'Desconto 10%',           'Em qualquer serviço',          100, 'discount',   'Bronze',   true,  true),
      (v_user, 'Limpeza de Pele Grátis', 'Serviço completo',             250, 'service',    'Prata',    false, true),
      (v_user, 'Kit Cuidados Premium',   'Produtos exclusivos',          400, 'product',    'Ouro',     true,  true),
      (v_user, 'Day Spa Completo',       'Experiência exclusiva VIP',    800, 'experience', 'Diamante', false, false);
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.ensure_loyalty_defaults() TO authenticated;
