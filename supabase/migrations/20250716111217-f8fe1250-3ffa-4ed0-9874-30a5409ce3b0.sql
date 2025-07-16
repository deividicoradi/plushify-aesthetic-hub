-- Corrigir ambiguidade na função get_available_slots
CREATE OR REPLACE FUNCTION public.get_available_slots(p_user_id uuid, p_date date, p_service_duration integer DEFAULT 60, p_slot_interval integer DEFAULT 30)
 RETURNS TABLE(slot_time time without time zone, is_available boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  day_of_week_num INTEGER;
  working_start TIME;
  working_end TIME;
  current_slot TIME;
BEGIN
  -- Calcular dia da semana
  day_of_week_num := EXTRACT(DOW FROM p_date);
  
  -- Obter horário de trabalho
  SELECT wh.start_time, wh.end_time
  INTO working_start, working_end
  FROM public.working_hours wh
  WHERE wh.user_id = p_user_id 
    AND wh.day_of_week = day_of_week_num
    AND wh.is_active = true
  LIMIT 1;
  
  -- Se não há horário de trabalho, retornar vazio
  IF working_start IS NULL THEN
    RETURN;
  END IF;
  
  -- Gerar slots disponíveis
  current_slot := working_start;
  
  WHILE current_slot + (p_service_duration || ' minutes')::INTERVAL <= working_end LOOP
    RETURN QUERY
    SELECT 
      current_slot,
      public.check_appointment_availability(p_user_id, p_date, current_slot, p_service_duration);
    
    current_slot := current_slot + (p_slot_interval || ' minutes')::INTERVAL;
  END LOOP;
END;
$function$;