-- Rate limiting para o fluxo público de agendamento (/agendar/:slug).
-- Hoje create_public_booking e get_public_services(slug) são chamáveis
-- por qualquer pessoa sem limite algum: um script pode lotar a agenda de
-- um salão com agendamentos falsos, ou martelar um slug conhecido
-- repetidamente pra raspar catálogo/preços. Como essas RPCs são chamadas
-- direto via PostgREST (sem edge function no meio), não temos acesso
-- confiável ao IP do chamador aqui — a mitigação é por identidade de
-- negócio (get_public_services, chave = slug) e por identidade de
-- negócio de destino (create_public_booking, chave = user_id do dono do
-- serviço), o que cobre o cenário mais realista (sabotar um concorrente
-- conhecido). Não cobre 100% raspagem em massa de MUITOS slugs
-- diferentes ao mesmo tempo — isso exigiria CAPTCHA ou uma edge function
-- capturando IP, fica como possível segunda etapa.

CREATE TABLE IF NOT EXISTS public.public_rate_limits (
  identifier text NOT NULL,
  endpoint text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  PRIMARY KEY (identifier, endpoint)
);

-- Só as próprias SECURITY DEFINER functions do fluxo público escrevem
-- aqui (via check_public_rate_limit); ninguém tem GRANT direto na tabela.
ALTER TABLE public.public_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_public_rate_limit(
  p_identifier text,
  p_endpoint text,
  p_max_requests integer,
  p_window_minutes integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.public_rate_limits;
BEGIN
  SELECT * INTO v_row
  FROM public.public_rate_limits
  WHERE identifier = p_identifier AND endpoint = p_endpoint
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.public_rate_limits (identifier, endpoint, window_start, request_count)
    VALUES (p_identifier, p_endpoint, now(), 1);
    RETURN true;
  END IF;

  IF now() - v_row.window_start > (p_window_minutes || ' minutes')::interval THEN
    UPDATE public.public_rate_limits
      SET window_start = now(), request_count = 1
      WHERE identifier = p_identifier AND endpoint = p_endpoint;
    RETURN true;
  END IF;

  IF v_row.request_count >= p_max_requests THEN
    RETURN false;
  END IF;

  UPDATE public.public_rate_limits
    SET request_count = request_count + 1
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
  RETURN true;
END;
$$;

-- Sem GRANT pra anon/authenticated: só chamada internamente (PERFORM/SELECT)
-- pelas outras SECURITY DEFINER functions abaixo, nunca direto pelo cliente.

-- get_public_services(slug): até 30 chamadas a cada 5 minutos por slug.
-- Generoso pro fluxo normal (cliente navegando/atualizando a página),
-- mas barra um script martelando o mesmo link.
CREATE OR REPLACE FUNCTION public.get_public_services(p_slug text)
RETURNS TABLE(id uuid, name text, description text, price numeric, duration integer, category text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT public.check_public_rate_limit('slug:' || p_slug, 'get_public_services', 30, 5) THEN
    RAISE EXCEPTION 'Muitas requisições, tente novamente em alguns minutos';
  END IF;

  SELECT user_id INTO v_user_id FROM public.booking_links WHERE slug = p_slug;
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT s.id, s.name, s.description, s.price, s.duration, s.category
  FROM public.services s
  WHERE s.active = true AND s.user_id = v_user_id
  ORDER BY s.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_services(text) TO anon, authenticated, service_role;

-- create_public_booking: até 8 agendamentos a cada 15 minutos por negócio
-- (dono do serviço). Cobre volume real de qualquer salão e barra flood
-- automatizado numa única agenda.
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
REVOKE EXECUTE ON FUNCTION public.get_public_services(text) FROM PUBLIC;
