-- Lembrete de Retorno: reengajar clientes que sumiram.
--
-- clients.last_visit existia na tabela mas nunca era atualizado por nada
-- (só gravado como NULL na criação do cliente) — corrigimos isso com um
-- trigger que atualiza o campo sempre que um agendamento é concluído,
-- pegando a data mais recente entre os concluídos do cliente.
--
-- Também adicionamos return_reminder_sent_at para rastrear (apenas
-- localmente, sem confirmação de entrega) quando o dono do salão clicou
-- em "enviar lembrete de retorno" para aquele cliente — mesmo padrão já
-- usado em appointments.reminder_sent_at.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS return_reminder_sent_at timestamptz;

CREATE OR REPLACE FUNCTION public.update_client_last_visit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'concluido' AND OLD.status IS DISTINCT FROM 'concluido' AND NEW.client_id IS NOT NULL THEN
    UPDATE public.clients
    SET last_visit = GREATEST(COALESCE(last_visit, NEW.appointment_date::timestamptz), NEW.appointment_date::timestamptz),
        updated_at = now()
    WHERE id = NEW.client_id AND user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_client_last_visit ON public.appointments;
CREATE TRIGGER trg_update_client_last_visit
AFTER UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_client_last_visit();

-- Backfill: reconstrói last_visit para clientes que já têm histórico de
-- agendamentos concluídos vinculados (client_id preenchido), já que o
-- trigger acima só passa a agir em updates futuros.
UPDATE public.clients c
SET last_visit = sub.last_completed
FROM (
  SELECT client_id, user_id, MAX(appointment_date) AS last_completed
  FROM public.appointments
  WHERE status = 'concluido' AND client_id IS NOT NULL
  GROUP BY client_id, user_id
) sub
WHERE c.id = sub.client_id AND c.user_id = sub.user_id
  AND (c.last_visit IS NULL OR c.last_visit < sub.last_completed::timestamptz);

-- Índice usado pela consulta de "clientes para reengajar" (dias desde a
-- última visita), evitando full scan por dono de conta.
CREATE INDEX IF NOT EXISTS idx_clients_user_last_visit ON public.clients(user_id, last_visit);
