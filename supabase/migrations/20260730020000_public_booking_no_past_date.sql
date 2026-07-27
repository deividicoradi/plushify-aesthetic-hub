-- create_public_booking não validava que a data do agendamento não estava
-- no passado — o date-picker do formulário público provavelmente impede
-- isso na UI, mas nada impedia uma chamada RPC direta (sem passar pelo
-- front) agendar num dia que já passou. Escopo restrito a este fluxo
-- público (não mexe em check_appointment_availability, usado também pelo
-- fluxo interno autenticado, onde back-dating pode ter usos legítimos como
-- correção manual de um agendamento).
CREATE OR REPLACE FUNCTION public.create_public_booking(p_client_name text, p_client_email text, p_client_phone text, p_service_id uuid, p_appointment_date date, p_appointment_time time, p_notes text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_service RECORD; v_appointment_id uuid; v_client_id uuid;
BEGIN
  SELECT id, name, price, duration, user_id INTO v_service FROM public.services WHERE id = p_service_id AND active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Serviço não encontrado ou inativo'; END IF;

  IF p_appointment_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Não é possível agendar em uma data que já passou';
  END IF;

  IF NOT public.check_public_rate_limit('biz:' || v_service.user_id::text, 'create_public_booking', 8, 15) THEN
    RAISE EXCEPTION 'Muitas tentativas de agendamento, tente novamente em alguns minutos';
  END IF;

  IF NOT public.check_appointment_availability(v_service.user_id, p_appointment_date, p_appointment_time, v_service.duration) THEN RAISE EXCEPTION 'Horário não disponível'; END IF;
  IF p_client_email IS NOT NULL AND p_client_email <> '' THEN
    SELECT id INTO v_client_id FROM public.clients WHERE user_id = v_service.user_id AND email = p_client_email LIMIT 1;
  END IF;
  IF v_client_id IS NULL AND p_client_phone IS NOT NULL AND p_client_phone <> '' THEN
    SELECT id INTO v_client_id FROM public.clients WHERE user_id = v_service.user_id AND phone = p_client_phone LIMIT 1;
  END IF;
  IF v_client_id IS NOT NULL THEN
    UPDATE public.clients SET name = p_client_name, email = p_client_email, phone = p_client_phone, updated_at = now() WHERE id = v_client_id;
  ELSE
    INSERT INTO public.clients (user_id, name, email, phone, status) VALUES (v_service.user_id, p_client_name, p_client_email, p_client_phone, 'Ativo') RETURNING id INTO v_client_id;
  END IF;
  INSERT INTO public.appointments (user_id, client_id, service_id, client_name, service_name, appointment_date, appointment_time, duration, price, status, notes)
  VALUES (v_service.user_id, v_client_id, p_service_id, p_client_name, v_service.name, p_appointment_date, p_appointment_time, v_service.duration, v_service.price, 'agendado', p_notes)
  RETURNING id INTO v_appointment_id;
  RETURN v_appointment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_public_booking(text, text, text, uuid, date, time, text) TO anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.create_public_booking(text, text, text, uuid, date, time, text) FROM PUBLIC;
