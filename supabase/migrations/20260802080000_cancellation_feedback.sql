-- Tela de retenção antes de confirmar o cancelamento: pergunta opcional
-- do motivo, sem bloquear nem pressionar (lícito conforme CDC — oferecer
-- ajuda/desconto é permitido, insistência excessiva não é; aqui é só uma
-- pergunta única, o cliente sempre pode seguir direto pro cancelamento).
-- Guarda a resposta pra dar visibilidade real de por que os clientes
-- saem, coisa que hoje não existe em lugar nenhum do sistema.

CREATE TABLE IF NOT EXISTS public.subscription_cancellation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid,
  billing_interval text,
  reason text,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_cancellation_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.subscription_cancellation_feedback FROM PUBLIC;
REVOKE ALL ON public.subscription_cancellation_feedback FROM anon;
GRANT ALL ON public.subscription_cancellation_feedback TO service_role;

-- self_cancel_subscription ganha p_reason/p_comment opcionais. Assinatura
-- muda (novos parâmetros) — dropa a versão anterior antes de recriar.
DROP FUNCTION IF EXISTS public.self_cancel_subscription();

CREATE OR REPLACE FUNCTION public.self_cancel_subscription(
  p_reason text DEFAULT NULL,
  p_comment text DEFAULT NULL
)
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

  IF p_reason IS NOT NULL OR p_comment IS NOT NULL THEN
    INSERT INTO public.subscription_cancellation_feedback
      (user_id, subscription_id, billing_interval, reason, comment)
    VALUES (auth.uid(), v_sub.id, v_sub.billing_interval, p_reason, p_comment);
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
        E'Cliente pediu cancelamento antecipado do plano anual pelo próprio painel.\nMeses já utilizados: %s\nMeses restantes: %s\nValor restante estimado: R$ %s\nMulta de cancelamento (10%%, Art. 51 CDC / jurisprudência sobre proporcionalidade): R$ %s\nReembolso estimado a processar: R$ %s\nMotivo informado: %s%s\n\nProcessar o estorno proporcional manualmente e confirmar o cancelamento.',
        v_months_used, v_months_remaining, v_remaining_value, v_penalty, v_refund,
        COALESCE(p_reason, 'não informado'),
        CASE WHEN p_comment IS NOT NULL AND btrim(p_comment) <> '' THEN E'\nComentário: ' || p_comment ELSE '' END
      ),
      'correcao',
      'atencao'
    );

    UPDATE public.user_subscriptions
    SET cancel_at_period_end = true, updated_at = now()
    WHERE id = v_sub.id;

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

REVOKE EXECUTE ON FUNCTION public.self_cancel_subscription(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.self_cancel_subscription(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.self_cancel_subscription(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.self_cancel_subscription(text, text) TO service_role;
