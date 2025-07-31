-- Criar tabelas para integração WhatsApp

-- Tabela para sessões do WhatsApp
CREATE TABLE public.whatsapp_sessoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sessao_serializada TEXT,
  status TEXT NOT NULL DEFAULT 'desconectado',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para contatos do WhatsApp
CREATE TABLE public.whatsapp_contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  ultima_interacao TIMESTAMP WITH TIME ZONE,
  cliente_id UUID,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para mensagens do WhatsApp
CREATE TABLE public.whatsapp_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contato_id UUID NOT NULL,
  sessao_id UUID NOT NULL,
  direcao TEXT NOT NULL CHECK (direcao IN ('enviada', 'recebida')),
  conteudo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto',
  status TEXT NOT NULL DEFAULT 'enviada',
  horario TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para whatsapp_sessoes
CREATE POLICY "Users can manage their WhatsApp sessions" 
ON public.whatsapp_sessoes 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para whatsapp_contatos
CREATE POLICY "Users can manage their WhatsApp contacts" 
ON public.whatsapp_contatos 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para whatsapp_mensagens
CREATE POLICY "Users can manage their WhatsApp messages" 
ON public.whatsapp_mensagens 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_whatsapp_sessoes_user_id ON public.whatsapp_sessoes(user_id);
CREATE INDEX idx_whatsapp_contatos_user_id ON public.whatsapp_contatos(user_id);
CREATE INDEX idx_whatsapp_contatos_telefone ON public.whatsapp_contatos(telefone);
CREATE INDEX idx_whatsapp_mensagens_user_id ON public.whatsapp_mensagens(user_id);
CREATE INDEX idx_whatsapp_mensagens_contato_id ON public.whatsapp_mensagens(contato_id);
CREATE INDEX idx_whatsapp_mensagens_horario ON public.whatsapp_mensagens(horario DESC);

-- Adicionar foreign keys
ALTER TABLE public.whatsapp_contatos 
ADD CONSTRAINT fk_whatsapp_contatos_cliente_id 
FOREIGN KEY (cliente_id) REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.whatsapp_mensagens 
ADD CONSTRAINT fk_whatsapp_mensagens_contato_id 
FOREIGN KEY (contato_id) REFERENCES public.whatsapp_contatos(id) ON DELETE CASCADE;

ALTER TABLE public.whatsapp_mensagens 
ADD CONSTRAINT fk_whatsapp_mensagens_sessao_id 
FOREIGN KEY (sessao_id) REFERENCES public.whatsapp_sessoes(id) ON DELETE CASCADE;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_sessoes_updated_at
BEFORE UPDATE ON public.whatsapp_sessoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_contatos_updated_at
BEFORE UPDATE ON public.whatsapp_contatos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();