-- Adiciona 'sem_retorno' como status de prospect (ex: chamou/mandou
-- mensagem mas a pessoa nunca respondeu). Conta como "em aberto" nas
-- métricas e no follow-up, já que essas consultas usam
-- "status NOT IN ('convertido','perdido')" — não precisa mudar lá.

DO $$
DECLARE
  v_conname text;
BEGIN
  SELECT conname INTO v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.prospects'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%IN%';

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.prospects DROP CONSTRAINT %I', v_conname);
  END IF;
END $$;

ALTER TABLE public.prospects
  ADD CONSTRAINT prospects_status_check
  CHECK (status IN ('novo','contatado','interessado','negociando','sem_retorno','convertido','perdido'));

CREATE OR REPLACE FUNCTION public.admin_set_prospect_status(
  p_id uuid,
  p_status text,
  p_loss_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF p_status NOT IN ('novo','contatado','interessado','negociando','sem_retorno','convertido','perdido') THEN
    RAISE EXCEPTION 'Status inválido';
  END IF;

  IF p_status = 'perdido' AND (p_loss_reason IS NULL OR length(trim(p_loss_reason)) = 0) THEN
    RAISE EXCEPTION 'Motivo da perda é obrigatório';
  END IF;

  UPDATE public.prospects
  SET status = p_status,
      loss_reason = CASE WHEN p_status = 'perdido' THEN p_loss_reason ELSE loss_reason END
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
END;
$$;
