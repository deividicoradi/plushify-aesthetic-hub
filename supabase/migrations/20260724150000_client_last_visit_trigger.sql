-- clients.last_visit nunca era escrito em lugar nenhum do sistema — a
-- coluna "Última Visita" na tabela de clientes e o filtro Hoje/7 dias/30
-- dias sempre ficavam vazios. Atualiza automaticamente quando um
-- agendamento do cliente é marcado como "concluido" (não em qualquer
-- status — um agendamento cancelado ou só marcado não é uma visita real).
CREATE OR REPLACE FUNCTION public.update_client_last_visit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'concluido' AND NEW.client_id IS NOT NULL THEN
    UPDATE public.clients
    SET last_visit = GREATEST(
          COALESCE(last_visit, NEW.appointment_date::timestamptz),
          NEW.appointment_date::timestamptz
        ),
        updated_at = now()
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_client_last_visit ON public.appointments;
CREATE TRIGGER trg_update_client_last_visit
AFTER INSERT OR UPDATE OF status ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_client_last_visit();
