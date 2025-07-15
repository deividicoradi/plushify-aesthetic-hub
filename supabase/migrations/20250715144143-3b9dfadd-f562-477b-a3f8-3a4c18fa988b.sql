-- Criar usuário especial para agendamentos públicos
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data, is_super_admin, role)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'public@plushify.com.br',
  now(),
  now(),
  now(),
  '{"name": "Sistema Público"}',
  '{"role": "system"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Criar função para agendamentos públicos
CREATE OR REPLACE FUNCTION public.create_public_booking(
  p_client_name TEXT,
  p_client_email TEXT,
  p_client_phone TEXT,
  p_service_id UUID,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_service_record RECORD;
  v_appointment_id UUID;
  v_client_id UUID;
  v_system_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
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
  
  -- Criar ou buscar cliente
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
  ) 
  ON CONFLICT (user_id, email) WHERE email IS NOT NULL
  DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    updated_at = now()
  RETURNING id INTO v_client_id;
  
  -- Se não conseguiu inserir/atualizar, tenta buscar por telefone
  IF v_client_id IS NULL THEN
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE user_id = v_service_record.user_id
      AND phone = p_client_phone
    LIMIT 1;
  END IF;
  
  -- Se ainda não encontrou, cria sem constraint de email
  IF v_client_id IS NULL THEN
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
$$;

-- Criar função para buscar serviços públicos
CREATE OR REPLACE FUNCTION public.get_public_services()
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  duration INTEGER,
  category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.description,
    s.price,
    s.duration,
    s.category
  FROM public.services s
  WHERE s.active = true
  ORDER BY s.name;
END;
$$;

-- Criar função para buscar horários disponíveis públicos
CREATE OR REPLACE FUNCTION public.get_public_available_slots(
  p_service_id UUID,
  p_date DATE
) RETURNS TABLE(
  slot_time TIME,
  is_available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_service_record RECORD;
BEGIN
  -- Buscar informações do serviço
  SELECT duration, user_id
  INTO v_service_record
  FROM public.services
  WHERE id = p_service_id AND active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Serviço não encontrado';
  END IF;
  
  -- Retornar horários disponíveis
  RETURN QUERY
  SELECT * FROM public.get_available_slots(
    v_service_record.user_id,
    p_date,
    v_service_record.duration,
    30 -- intervalo de 30 minutos
  );
END;
$$;