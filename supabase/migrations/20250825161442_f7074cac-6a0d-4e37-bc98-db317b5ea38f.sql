-- Criar tabelas WhatsApp (contatos já existe, vamos só adicionar mensagens)
CREATE TABLE IF NOT EXISTS public.whatsapp_mensagens_temp (
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

-- Habilitar RLS na nova tabela
ALTER TABLE public.whatsapp_mensagens_temp ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own WhatsApp messages" 
ON public.whatsapp_mensagens_temp 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own WhatsApp messages" 
ON public.whatsapp_mensagens_temp 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WhatsApp messages" 
ON public.whatsapp_mensagens_temp 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WhatsApp messages" 
ON public.whatsapp_mensagens_temp 
FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_whatsapp_mensagens_temp_user_id ON public.whatsapp_mensagens_temp(user_id);
CREATE INDEX idx_whatsapp_mensagens_temp_contato_id ON public.whatsapp_mensagens_temp(contato_id);
CREATE INDEX idx_whatsapp_mensagens_temp_horario ON public.whatsapp_mensagens_temp(horario DESC);