-- Corrigir função create_public_booking removendo ON CONFLICT problemático
CREATE OR REPLACE FUNCTION public.create_public_booking(p_client_name text, p_client_email text, p_client_phone text, p_service_id uuid, p_appointment_date date, p_appointment_time time without time zone, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_service_record RECORD;
  v_appointment_id UUID;
  v_client_id UUID;
BEGIN
  -- Buscar informações do serviço
  SELECT id, name, price, duration, user_id
  INTO v_service_record
  FROM public.services
  WHERE id = p_service_id AND active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Serviço não encontrado ou inativo';
  END IF;
  
  -- Verificar disponibilidade do horário
  IF NOT public.check_appointment_availability(
    v_service_record.user_id,
    p_appointment_date,
    p_appointment_time,
    v_service_record.duration
  ) THEN
    RAISE EXCEPTION 'Horário não disponível';
  END IF;
  
  -- Buscar cliente existente por email (se fornecido)
  IF p_client_email IS NOT NULL AND p_client_email != '' THEN
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE user_id = v_service_record.user_id
      AND email = p_client_email
    LIMIT 1;
  END IF;
  
  -- Se não encontrou por email, buscar por telefone
  IF v_client_id IS NULL AND p_client_phone IS NOT NULL AND p_client_phone != '' THEN
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE user_id = v_service_record.user_id
      AND phone = p_client_phone
    LIMIT 1;
  END IF;
  
  -- Se encontrou cliente existente, atualizar dados
  IF v_client_id IS NOT NULL THEN
    UPDATE public.clients SET
      name = p_client_name,
      email = p_client_email,
      phone = p_client_phone,
      updated_at = now()
    WHERE id = v_client_id;
  ELSE
    -- Criar novo cliente
    INSERT INTO public.clients (
      user_id,
      name,
      email,
      phone,
      status
    ) VALUES (
      v_service_record.user_id,
      p_client_name,
      p_client_email,
      p_client_phone,
      'Ativo'
    ) RETURNING id INTO v_client_id;
  END IF;
  
  -- Criar agendamento
  INSERT INTO public.appointments (
    user_id,
    client_id,
    service_id,
    client_name,
    service_name,
    appointment_date,
    appointment_time,
    duration,
    price,
    status,
    notes
  ) VALUES (
    v_service_record.user_id,
    v_client_id,
    p_service_id,
    p_client_name,
    v_service_record.name,
    p_appointment_date,
    p_appointment_time,
    v_service_record.duration,
    v_service_record.price,
    'agendado',
    p_notes
  ) RETURNING id INTO v_appointment_id;
  
  RETURN v_appointment_id;
END;
$function$;