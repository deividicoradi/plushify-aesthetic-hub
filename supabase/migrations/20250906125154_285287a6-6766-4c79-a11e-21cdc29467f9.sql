-- Criar tabela de profissionais
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialties TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for professionals
CREATE POLICY "professionals_select_optimized" 
ON public.professionals 
FOR SELECT 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "professionals_insert_optimized" 
ON public.professionals 
FOR INSERT 
WITH CHECK ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "professionals_update_optimized" 
ON public.professionals 
FOR UPDATE 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()))
WITH CHECK ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "professionals_delete_optimized" 
ON public.professionals 
FOR DELETE 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

-- Criar tabela de relacionamento entre serviços e profissionais
CREATE TABLE public.service_professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id, professional_id)
);

-- Enable RLS
ALTER TABLE public.service_professionals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_professionals
CREATE POLICY "service_professionals_select_optimized" 
ON public.service_professionals 
FOR SELECT 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "service_professionals_insert_optimized" 
ON public.service_professionals 
FOR INSERT 
WITH CHECK ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "service_professionals_update_optimized" 
ON public.service_professionals 
FOR UPDATE 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()))
WITH CHECK ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "service_professionals_delete_optimized" 
ON public.service_professionals 
FOR DELETE 
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

-- Adicionar novas colunas à tabela working_hours
ALTER TABLE public.working_hours ADD COLUMN auto_confirm_appointments BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.working_hours ADD COLUMN auto_complete_appointments BOOLEAN NOT NULL DEFAULT false;

-- Adicionar coluna professional_id à tabela appointments
ALTER TABLE public.appointments ADD COLUMN professional_id UUID;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_professionals_updated_at
BEFORE UPDATE ON public.professionals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar agendamentos pendentes em um dia
CREATE OR REPLACE FUNCTION public.check_pending_appointments_for_day(
  p_user_id UUID,
  p_day_of_week INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  has_pending BOOLEAN;
BEGIN
  -- Verificar se há agendamentos pendentes para esse dia da semana
  SELECT EXISTS(
    SELECT 1 
    FROM public.appointments a
    WHERE a.user_id = p_user_id 
      AND EXTRACT(DOW FROM a.appointment_date) = p_day_of_week
      AND a.status IN ('agendado', 'confirmado')
      AND a.appointment_date >= CURRENT_DATE
  ) INTO has_pending;
  
  RETURN has_pending;
END;
$$;

-- Função para confirmar agendamentos automaticamente
CREATE OR REPLACE FUNCTION public.auto_confirm_appointments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  confirmed_count INTEGER := 0;
  current_dow INTEGER;
BEGIN
  -- Obter o dia da semana atual (0 = domingo)
  current_dow := EXTRACT(DOW FROM CURRENT_DATE);
  
  -- Confirmar agendamentos automáticos para hoje
  UPDATE public.appointments
  SET status = 'confirmado',
      updated_at = now()
  WHERE status = 'agendado'
    AND appointment_date = CURRENT_DATE
    AND user_id IN (
      SELECT DISTINCT wh.user_id
      FROM public.working_hours wh
      WHERE wh.day_of_week = current_dow
        AND wh.is_active = true
        AND wh.auto_confirm_appointments = true
    );
  
  GET DIAGNOSTICS confirmed_count = ROW_COUNT;
  
  RETURN confirmed_count;
END;
$$;

-- Função para concluir agendamentos automaticamente
CREATE OR REPLACE FUNCTION public.auto_complete_appointments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  completed_count INTEGER := 0;
  current_dow INTEGER;
BEGIN
  -- Obter o dia da semana atual (0 = domingo)
  current_dow := EXTRACT(DOW FROM CURRENT_DATE);
  
  -- Concluir agendamentos automáticos para hoje
  UPDATE public.appointments
  SET status = 'concluido',
      updated_at = now()
  WHERE status = 'confirmado'
    AND appointment_date = CURRENT_DATE
    AND (appointment_time + (duration || ' minutes')::INTERVAL) < CURRENT_TIME
    AND user_id IN (
      SELECT DISTINCT wh.user_id
      FROM public.working_hours wh
      WHERE wh.day_of_week = current_dow
        AND wh.is_active = true
        AND wh.auto_complete_appointments = true
    );
  
  GET DIAGNOSTICS completed_count = ROW_COUNT;
  
  RETURN completed_count;
END;
$$;

-- Função para buscar profissionais por serviço
CREATE OR REPLACE FUNCTION public.get_professionals_by_service(
  p_user_id UUID,
  p_service_id UUID
) RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  specialties TEXT[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.specialties
  FROM public.professionals p
  INNER JOIN public.service_professionals sp ON sp.professional_id = p.id
  WHERE sp.user_id = p_user_id
    AND sp.service_id = p_service_id
    AND p.active = true
  ORDER BY p.name;
END;
$$;