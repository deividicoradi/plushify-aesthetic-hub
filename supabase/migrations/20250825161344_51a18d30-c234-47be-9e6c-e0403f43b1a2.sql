-- Verificar se tabelas WhatsApp existem e criar se necessário
CREATE TABLE IF NOT EXISTS public.whatsapp_contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  ultima_interacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cliente_id UUID REFERENCES public.clients(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contato_id UUID NOT NULL REFERENCES public.whatsapp_contatos(id) ON DELETE CASCADE,
  direcao TEXT NOT NULL CHECK (direcao IN ('enviada', 'recebida')),
  conteudo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'text',
  status TEXT NOT NULL DEFAULT 'enviada',
  horario TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para whatsapp_contatos
CREATE POLICY IF NOT EXISTS "Users can view their own WhatsApp contacts" 
ON public.whatsapp_contatos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own WhatsApp contacts" 
ON public.whatsapp_contatos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own WhatsApp contacts" 
ON public.whatsapp_contatos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own WhatsApp contacts" 
ON public.whatsapp_contatos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas de segurança para whatsapp_mensagens
CREATE POLICY IF NOT EXISTS "Users can view their own WhatsApp messages" 
ON public.whatsapp_mensagens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own WhatsApp messages" 
ON public.whatsapp_mensagens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own WhatsApp messages" 
ON public.whatsapp_mensagens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own WhatsApp messages" 
ON public.whatsapp_mensagens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_contatos_user_id ON public.whatsapp_contatos(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contatos_telefone ON public.whatsapp_contatos(telefone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_user_id ON public.whatsapp_mensagens(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_contato_id ON public.whatsapp_mensagens(contato_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_horario ON public.whatsapp_mensagens(horario DESC);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_whatsapp_contatos_updated_at ON public.whatsapp_contatos;
CREATE TRIGGER update_whatsapp_contatos_updated_at
BEFORE UPDATE ON public.whatsapp_contatos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();