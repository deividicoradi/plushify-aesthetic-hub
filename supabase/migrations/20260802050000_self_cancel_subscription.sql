-- Cancelamento self-service pelo cliente: hoje só o admin conseguia
-- cancelar, obrigando o cliente a abrir chamado e esperar. Pelo princípio
-- consolidado no CDC (cancelar tem que ser tão fácil quanto contratar),
-- isso é risco de prática abusiva. Reaproveita a mesma semântica graciosa
-- de cancel_subscription (mensal: sem multa, acesso até o fim do período
-- já pago) para o caso simples.
--
-- Plano anual: o cálculo de multa proporcional (10% sobre o saldo
-- restante, conforme jurisprudência) e o reembolso parcial correspondente
-- não têm como ser processados com segurança de forma 100% automática
-- ainda (a integração de reembolso com a AbacatePay hoje só cobre estorno
-- total de uma cobrança, não parcial) — por isso a solicitação é
-- registrada na hora (o cliente não fica esperando abrir chamado sozinho)
-- e vira um chamado de Suporte de prioridade "Atenção" pro time processar
-- o reembolso proporcional manualmente. O acesso continua ativo até a
-- equipe confirmar (mesma lógica seria pior se cortássemos o acesso antes
-- do reembolso ser processado).

CREATE OR REPLACE FUNCTION public.self_cancel_subscription()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub record;
  v_months_used integer;
  v_months_remaining integer;
  v_monthly_value numeric;
  v_remaining_value numeric;
  v_penalty numeric;
  v_refund numeric;
  v_event_number integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT * INTO v_sub
  FROM public.user_subscriptions
  WHERE user_id = auth.uid() AND status = 'active'
  ORDER BY started_at DESC
  LIMIT 1;

  IF v_sub.id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma assinatura paga ativa encontrada';
  END IF;

  IF v_sub.cancel_at_period_end THEN
    RAISE EXCEPTION 'Essa assinatura já está marcada para cancelamento';
  END IF;

  IF v_sub.billing_interval = 'year' THEN
    v_months_used := GREATEST(1, LEAST(12, CEIL(EXTRACT(EPOCH FROM (now() - v_sub.started_at)) / (30.0 * 86400))::integer));
    v_months_remaining := GREATEST(0, 12 - v_months_used);
    v_monthly_value := COALESCE(v_sub.plan_amount_paid, 0) / 100.0 / 12.0;
    v_remaining_value := round(v_monthly_value * v_months_remaining, 2);
    v_penalty := round(v_remaining_value * 0.10, 2);
    v_refund := round(v_remaining_value - v_penalty, 2);

    v_event_number := public.submit_support_event(
      'Cancelamento de plano anual solicitado pelo cliente',
      format(
        E'Cliente pediu cancelamento antecipado do plano anual pelo próprio painel.\nMeses já utilizados: %s\nMeses restantes: %s\nValor restante estimado: R$ %s\nMulta de cancelamento (10%%, Art. 51 CDC / jurisprudência sobre proporcionalidade): R$ %s\nReembolso estimado a processar: R$ %s\n\nProcessar o estorno proporcional manualmente e confirmar o cancelamento.',
        v_months_used, v_months_remaining, v_remaining_value, v_penalty, v_refund
      ),
      'correcao',
      'atencao'
    );

    RETURN jsonb_build_object(
      'kind', 'year',
      'event_number', v_event_number,
      'months_remaining', v_months_remaining,
      'remaining_value', v_remaining_value,
      'penalty', v_penalty,
      'estimated_refund', v_refund
    );
  ELSE
    UPDATE public.user_subscriptions
    SET cancel_at_period_end = true, updated_at = now()
    WHERE id = v_sub.id;

    RETURN jsonb_build_object('kind', 'month', 'expires_at', v_sub.expires_at);
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.self_cancel_subscription() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.self_cancel_subscription() FROM anon;
GRANT EXECUTE ON FUNCTION public.self_cancel_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION public.self_cancel_subscription() TO service_role;
