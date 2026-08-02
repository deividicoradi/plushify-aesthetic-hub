-- Bug real encontrado em revisão: get_account_deletion_status() e
-- anonymize_account_data() liberavam a exclusão da conta assim que
-- cancel_at_period_end virava true — o que agora também acontece pro
-- plano ANUAL assim que o cliente só PEDE o cancelamento (antes mesmo do
-- reembolso proporcional ser processado). Resultado: um cliente do plano
-- anual podia pedir cancelamento e, na sequência, excluir a conta (login
-- banido, e-mail trocado) enquanto ainda tem dinheiro a receber e o
-- admin nem viu o chamado ainda.
--
-- Corrige a regra: pro plano MENSAL, cancel_at_period_end=true já é
-- suficiente pra liberar (nada fica pendente — só para de renovar).
-- Pro plano ANUAL, só libera quando o admin realmente processa e muda o
-- status pra fora de 'active' (cancelado/reembolsado) — cancel_at_period_end
-- sozinho não é suficiente, porque ainda pode haver reembolso pendente.

CREATE OR REPLACE FUNCTION public.get_account_deletion_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blocked boolean;
  v_annual_pending boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND plan_type IN ('professional', 'premium')
      AND (
        (billing_interval IS DISTINCT FROM 'year' AND cancel_at_period_end IS NOT TRUE)
        OR billing_interval = 'year'
      )
  ) INTO v_blocked;

  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND billing_interval = 'year'
      AND cancel_at_period_end IS TRUE
  ) INTO v_annual_pending;

  RETURN jsonb_build_object(
    'can_delete', NOT v_blocked,
    'blocking_reason', CASE
      WHEN v_annual_pending THEN 'Seu cancelamento do plano anual já foi solicitado e está aguardando nossa equipe processar o reembolso proporcional. Você poderá excluir a conta assim que isso for concluído.'
      WHEN v_blocked THEN 'Você tem uma assinatura paga ativa. Cancele-a primeiro (em Configurações > Conta) para poder excluir sua conta.'
      ELSE NULL
    END
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_account_deletion_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_account_deletion_status() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_account_deletion_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_account_deletion_status() TO service_role;

CREATE OR REPLACE FUNCTION public.anonymize_account_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blocked boolean;
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND plan_type IN ('professional', 'premium')
      AND (
        (billing_interval IS DISTINCT FROM 'year' AND cancel_at_period_end IS NOT TRUE)
        OR billing_interval = 'year'
      )
  ) INTO v_blocked;

  IF v_blocked THEN
    RAISE EXCEPTION 'Cancele sua assinatura paga antes de excluir a conta (planos anuais só liberam depois que o reembolso proporcional é processado pela equipe)';
  END IF;

  SELECT email::text INTO v_email FROM auth.users WHERE id = auth.uid();

  UPDATE public.profiles
  SET name = 'Conta excluída', phone = NULL, profession = NULL
  WHERE id = auth.uid();

  INSERT INTO public.account_deletion_log (user_id, email_before)
  VALUES (auth.uid(), COALESCE(v_email, 'desconhecido'));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.anonymize_account_data() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.anonymize_account_data() FROM anon;
GRANT EXECUTE ON FUNCTION public.anonymize_account_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_account_data() TO service_role;
