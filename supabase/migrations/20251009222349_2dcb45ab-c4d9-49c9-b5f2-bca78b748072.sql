-- ============================================
-- TABELA DE NOTIFICAÇÕES POR USUÁRIO
-- Sistema de notificações personalizado e auditado
-- ============================================

-- 1. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT notifications_user_id_not_null CHECK (user_id IS NOT NULL),
  CONSTRAINT notifications_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT notifications_message_not_empty CHECK (length(trim(message)) > 0)
);

-- 2. Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS RESTRICTIVE (usuário só vê suas notificações)
CREATE POLICY "notifications_select_restricted"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_restricted"
ON public.notifications
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_update_restricted"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_restricted"
ON public.notifications
FOR DELETE
USING (user_id = auth.uid());

-- 4. Criar índices para performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;

-- 5. Adicionar comentário de documentação
COMMENT ON TABLE public.notifications IS 'Notificações personalizadas por usuário. Protected by RESTRICTIVE RLS policies ensuring users can only access their own notifications.';

-- 6. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- 7. Função para criar notificação de estoque baixo (automática via trigger)
CREATE OR REPLACE FUNCTION create_low_stock_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Se estoque ficou abaixo do mínimo, criar notificação
  IF NEW.stock_quantity <= NEW.min_stock_level AND 
     (OLD.stock_quantity IS NULL OR OLD.stock_quantity > NEW.min_stock_level) THEN
    
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'warning',
      'Estoque Baixo',
      NEW.name || ' está com apenas ' || NEW.stock_quantity || ' unidades em estoque',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_name', NEW.name,
        'current_stock', NEW.stock_quantity,
        'min_stock', NEW.min_stock_level
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Trigger para produtos (estoque baixo)
DROP TRIGGER IF EXISTS low_stock_notification_trigger ON public.products;
CREATE TRIGGER low_stock_notification_trigger
  AFTER INSERT OR UPDATE OF stock_quantity ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION create_low_stock_notification();

-- 9. Função para criar notificação de agendamento confirmado
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando agendamento é confirmado
  IF NEW.status = 'confirmado' AND (OLD.status IS NULL OR OLD.status != 'confirmado') THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'info',
      'Agendamento Confirmado',
      NEW.client_name || ' confirmou o agendamento para ' || 
      to_char(NEW.appointment_date, 'DD/MM') || ' às ' || 
      to_char(NEW.appointment_time, 'HH24:MI'),
      jsonb_build_object(
        'appointment_id', NEW.id,
        'client_name', NEW.client_name,
        'appointment_date', NEW.appointment_date,
        'appointment_time', NEW.appointment_time
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Trigger para agendamentos
DROP TRIGGER IF EXISTS appointment_notification_trigger ON public.appointments;
CREATE TRIGGER appointment_notification_trigger
  AFTER INSERT OR UPDATE OF status ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_notification();

-- 11. Revogar acesso anônimo
REVOKE ALL ON public.notifications FROM anon;
REVOKE ALL ON public.notifications FROM public;

-- 12. Garantir permissões para usuários autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;