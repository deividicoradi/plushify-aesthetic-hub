-- Criar tabela para horários de trabalho dos profissionais
CREATE TABLE public.working_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = domingo, 6 = sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Habilitar RLS na tabela working_hours
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para working_hours
CREATE POLICY "working_hours_select_optimized" 
ON public.working_hours 
FOR SELECT 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "working_hours_insert_optimized" 
ON public.working_hours 
FOR INSERT 
WITH CHECK ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "working_hours_update_optimized" 
ON public.working_hours 
FOR UPDATE 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()))
WITH CHECK ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "working_hours_delete_optimized" 
ON public.working_hours 
FOR DELETE 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_working_hours_updated_at
BEFORE UPDATE ON public.working_hours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar disponibilidade de agendamento
CREATE OR REPLACE FUNCTION public.check_appointment_availability(
  p_user_id UUID,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_duration INTEGER,
  p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  appointment_end_time TIME;
  day_of_week INTEGER;
  working_start TIME;
  working_end TIME;
  conflict_count INTEGER;
BEGIN
  -- Calcular horário de fim do agendamento
  appointment_end_time := p_appointment_time + (p_duration || ' minutes')::INTERVAL;
  
  -- Calcular dia da semana (0 = domingo)
  day_of_week := EXTRACT(DOW FROM p_appointment_date);
  
  -- Verificar se está dentro do horário de trabalho
  SELECT start_time, end_time
  INTO working_start, working_end
  FROM public.working_hours
  WHERE user_id = p_user_id 
    AND day_of_week = day_of_week
    AND is_active = true
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
  FROM public.appointments
  WHERE user_id = p_user_id
    AND appointment_date = p_appointment_date
    AND status NOT IN ('cancelado')
    AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
    AND (
      -- Novo agendamento começa durante um existente
      (p_appointment_time >= appointment_time AND p_appointment_time < (appointment_time + (duration || ' minutes')::INTERVAL)) OR
      -- Novo agendamento termina durante um existente
      (appointment_end_time > appointment_time AND appointment_end_time <= (appointment_time + (duration || ' minutes')::INTERVAL)) OR
      -- Novo agendamento engloba um existente
      (p_appointment_time <= appointment_time AND appointment_end_time >= (appointment_time + (duration || ' minutes')::INTERVAL))
    );
  
  RETURN conflict_count = 0;
END;
$$;

-- Função para obter horários disponíveis em uma data
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_user_id UUID,
  p_date DATE,
  p_service_duration INTEGER DEFAULT 60,
  p_slot_interval INTEGER DEFAULT 30
)
RETURNS TABLE(slot_time TIME, is_available BOOLEAN)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  day_of_week INTEGER;
  working_start TIME;
  working_end TIME;
  current_slot TIME;
BEGIN
  -- Calcular dia da semana
  day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Obter horário de trabalho
  SELECT start_time, end_time
  INTO working_start, working_end
  FROM public.working_hours
  WHERE user_id = p_user_id 
    AND day_of_week = day_of_week
    AND is_active = true
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
$$;

-- Trigger para validar agendamentos antes de inserir/atualizar
CREATE OR REPLACE FUNCTION public.validate_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar disponibilidade
  IF NOT public.check_appointment_availability(
    NEW.user_id,
    NEW.appointment_date,
    NEW.appointment_time,
    NEW.duration,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'Horário não disponível. Verifique conflitos ou horário de trabalho.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela appointments
CREATE TRIGGER validate_appointment_trigger
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.validate_appointment();