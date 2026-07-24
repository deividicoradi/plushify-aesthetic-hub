-- Fluxo de resgate de recompensa de fidelidade. Antes disso, o botão
-- "Resgatar" no catálogo (RewardItem.tsx) não tinha nenhuma ação associada:
-- não existia insert em loyalty_point_transactions/loyalty_reward_redemptions
-- em lugar nenhum da aplicação.
--
-- Feito como função no banco (em vez de dois inserts soltos no client) para
-- que o saldo de pontos seja validado e debitado atomicamente, evitando
-- corrida entre dois resgates simultâneos do mesmo cliente e evitando ficar
-- com a transação de pontos gravada sem o registro de resgate (ou vice-versa)
-- em caso de falha no meio do fluxo.

CREATE OR REPLACE FUNCTION public.redeem_loyalty_reward(p_client_id uuid, p_reward_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_reward public.loyalty_rewards%ROWTYPE;
  v_client public.clients%ROWTYPE;
  v_validity_days integer;
  v_cutoff timestamptz;
  v_balance numeric;
  v_redemption_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_client FROM public.clients WHERE id = p_client_id AND user_id = v_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'cliente não encontrado';
  END IF;

  SELECT * INTO v_reward FROM public.loyalty_rewards
    WHERE id = p_reward_id AND user_id = v_user AND active = true AND available = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'recompensa não encontrada ou indisponível';
  END IF;

  SELECT points_validity_days INTO v_validity_days FROM public.loyalty_settings WHERE user_id = v_user;
  v_cutoff := CASE WHEN v_validity_days IS NOT NULL THEN now() - (v_validity_days || ' days')::interval ELSE NULL END;

  SELECT COALESCE(SUM(CASE WHEN kind = 'spend' THEN -points ELSE points END), 0) INTO v_balance
    FROM public.loyalty_point_transactions
    WHERE user_id = v_user AND client_id = p_client_id
      AND (kind = 'spend' OR v_cutoff IS NULL OR created_at >= v_cutoff);

  IF v_balance < v_reward.points_cost THEN
    RAISE EXCEPTION 'saldo de pontos insuficiente';
  END IF;

  INSERT INTO public.loyalty_point_transactions (user_id, client_id, kind, source, points, description, reference_id)
    VALUES (v_user, p_client_id, 'spend', 'redemption', v_reward.points_cost, 'Resgate: ' || v_reward.title, v_reward.id);

  INSERT INTO public.loyalty_reward_redemptions
    (user_id, client_id, reward_id, reward_title, points_used, estimated_value, status)
    VALUES (v_user, p_client_id, v_reward.id, v_reward.title, v_reward.points_cost, 0, 'delivered')
    RETURNING id INTO v_redemption_id;

  RETURN v_redemption_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_loyalty_reward(uuid, uuid) TO authenticated;
