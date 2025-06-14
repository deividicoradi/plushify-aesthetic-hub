
-- Criar tabela para logs de auditoria
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios logs
CREATE POLICY "Users can view their own audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem logs
CREATE POLICY "Users can create audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar tabela para senhas de autorização (opcional - para permitir senhas personalizadas por usuário)
CREATE TABLE public.authorization_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de senhas
ALTER TABLE public.authorization_passwords ENABLE ROW LEVEL SECURITY;

-- Política para usuários gerenciarem apenas sua própria senha
CREATE POLICY "Users can manage their own authorization password" 
  ON public.authorization_passwords 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);
