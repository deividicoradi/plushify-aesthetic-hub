
-- Criar tabela para armazenar análises automáticas do dashboard
CREATE TABLE public.dashboard_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metrics JSONB NOT NULL,
  insights JSONB NOT NULL,
  trends JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para garantir que usuários vejam apenas suas próprias análises
ALTER TABLE public.dashboard_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own analytics" 
  ON public.dashboard_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" 
  ON public.dashboard_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
  ON public.dashboard_analytics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics" 
  ON public.dashboard_analytics 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índice para melhor performance
CREATE INDEX idx_dashboard_analytics_user_date ON public.dashboard_analytics(user_id, analysis_date DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_dashboard_analytics_updated_at
  BEFORE UPDATE ON public.dashboard_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
