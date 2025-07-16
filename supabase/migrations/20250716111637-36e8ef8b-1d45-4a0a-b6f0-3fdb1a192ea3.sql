-- Corrigir ambiguidade na função check_appointment_availability
CREATE OR REPLACE FUNCTION public.check_appointment_availability(p_user_id uuid, p_appointment_date date, p_appointment_time time without time zone, p_duration integer, p_exclude_appointment_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  appointment_end_time TIME;
  day_of_week_num INTEGER;
  working_start TIME;
  working_end TIME;
  conflict_count INTEGER;
BEGIN
  -- Calcular horário de fim do agendamento
  appointment_end_time := p_appointment_time + (p_duration || ' minutes')::INTERVAL;
  
  -- Calcular dia da semana (0 = domingo)
  day_of_week_num := EXTRACT(DOW FROM p_appointment_date);
  
  -- Verificar se está dentro do horário de trabalho
  SELECT wh.start_time, wh.end_time
  INTO working_start, working_end
  FROM public.working_hours wh
  WHERE wh.user_id = p_user_id 
    AND wh.day_of_week = day_of_week_num
    AND wh.is_active = true
  LIMIT 1;
  
  -- Se não há horário de trabalho definido, não está disponível
  IF working_start IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o agendamento está dentro do horário de trabalho
  IF p_appointment_time < working_start OR appointment_end_time > working_end THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar conflitos com outros agendamentos
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.appointments a
  WHERE a.user_id = p_user_id
    AND a.appointment_date = p_appointment_date
    AND a.status NOT IN ('cancelado')
    AND (p_exclude_appointment_id IS NULL OR a.id != p_exclude_appointment_id)
    AND (
      -- Novo agendamento começa durante um existente
      (p_appointment_time >= a.appointment_time AND p_appointment_time < (a.appointment_time + (a.duration || ' minutes')::INTERVAL)) OR
      -- Novo agendamento termina durante um existente
      (appointment_end_time > a.appointment_time AND appointment_end_time <= (a.appointment_time + (a.duration || ' minutes')::INTERVAL)) OR
      -- Novo agendamento engloba um existente
      (p_appointment_time <= a.appointment_time AND appointment_end_time >= (a.appointment_time + (a.duration || ' minutes')::INTERVAL))
    );
  
  RETURN conflict_count = 0;
END;
$function$;