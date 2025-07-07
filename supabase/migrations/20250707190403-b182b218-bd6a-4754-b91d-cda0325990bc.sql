-- Função de segurança para verificar se o usuário tem acesso aos dados
CREATE OR REPLACE FUNCTION public.verify_user_access(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o user_id corresponde ao usuário autenticado
  IF target_user_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Função para log de tentativas de acesso não autorizado
CREATE OR REPLACE FUNCTION public.log_unauthorized_access(
  table_name TEXT,
  attempted_user_id UUID,
  actual_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    reason,
    new_data
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
    'UNAUTHORIZED_ACCESS_ATTEMPT',
    table_name,
    attempted_user_id,
    'User attempted to access data from different user',
    jsonb_build_object(
      'attempted_user_id', attempted_user_id,
      'actual_user_id', actual_user_id,
      'timestamp', now()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar políticas RLS mais seguras para a tabela clients
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "clients_select_policy" ON public.clients
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "clients_insert_policy" ON public.clients
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "clients_update_policy" ON public.clients
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "clients_delete_policy" ON public.clients
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Recriar políticas RLS mais seguras para a tabela appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;

CREATE POLICY "appointments_select_policy" ON public.appointments
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "appointments_insert_policy" ON public.appointments
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "appointments_update_policy" ON public.appointments
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "appointments_delete_policy" ON public.appointments
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Recriar políticas RLS mais seguras para a tabela services
DROP POLICY IF EXISTS "Users can view their own services" ON public.services;
DROP POLICY IF EXISTS "Users can create their own services" ON public.services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;

CREATE POLICY "services_select_policy" ON public.services
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "services_insert_policy" ON public.services
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "services_update_policy" ON public.services
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "services_delete_policy" ON public.services
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Recriar políticas RLS mais seguras para a tabela products
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Users can create their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

CREATE POLICY "products_select_policy" ON public.products
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "products_insert_policy" ON public.products
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "products_update_policy" ON public.products
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "products_delete_policy" ON public.products
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Recriar políticas RLS mais seguras para a tabela payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete their own payments" ON public.payments;

CREATE POLICY "payments_select_policy" ON public.payments
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "payments_insert_policy" ON public.payments
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "payments_update_policy" ON public.payments
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "payments_delete_policy" ON public.payments
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Verificar se RLS está habilitado em todas as tabelas críticas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_closures ENABLE ROW LEVEL SECURITY;

-- Criar índices para performance otimizada nas consultas de segurança
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_user_id ON public.installments(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);

-- Função para verificar integridade de dados por usuário
CREATE OR REPLACE FUNCTION public.verify_data_integrity(check_user_id UUID)
RETURNS TABLE (
  table_name TEXT,
  total_records BIGINT,
  unauthorized_records BIGINT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'clients'::TEXT, 
         COUNT(*)::BIGINT, 
         COUNT(*) FILTER (WHERE user_id != check_user_id)::BIGINT,
         CASE WHEN COUNT(*) FILTER (WHERE user_id != check_user_id) = 0 
              THEN 'SECURE' 
              ELSE 'BREACH DETECTED' 
         END::TEXT
  FROM public.clients 
  WHERE user_id = check_user_id;
  
  RETURN QUERY
  SELECT 'appointments'::TEXT, 
         COUNT(*)::BIGINT, 
         COUNT(*) FILTER (WHERE user_id != check_user_id)::BIGINT,
         CASE WHEN COUNT(*) FILTER (WHERE user_id != check_user_id) = 0 
              THEN 'SECURE' 
              ELSE 'BREACH DETECTED' 
         END::TEXT
  FROM public.appointments 
  WHERE user_id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;