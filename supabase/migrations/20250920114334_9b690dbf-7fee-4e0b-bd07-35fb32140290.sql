-- 🔴 CORREÇÃO 1: Otimizar políticas RLS com SELECT auth.uid()
-- Substituir current_setting() e chamadas diretas por SELECT auth.uid()

-- Otimizar políticas da tabela team_members
DROP POLICY IF EXISTS "team_members_delete_optimized" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_optimized" ON public.team_members;
DROP POLICY IF EXISTS "team_members_select_optimized" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update_optimized" ON public.team_members;

CREATE POLICY "team_members_optimized" ON public.team_members
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()))
WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

-- Otimizar políticas da tabela whatsapp_contatos
DROP POLICY IF EXISTS "Users can manage their WhatsApp contacts" ON public.whatsapp_contatos;

CREATE POLICY "whatsapp_contatos_optimized" ON public.whatsapp_contatos
FOR ALL USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Otimizar políticas da tabela whatsapp_mensagens_temp
DROP POLICY IF EXISTS "whatsapp_mensagens_temp_delete_own_only" ON public.whatsapp_mensagens_temp;
DROP POLICY IF EXISTS "whatsapp_mensagens_temp_insert_own_only" ON public.whatsapp_mensagens_temp;
DROP POLICY IF EXISTS "whatsapp_mensagens_temp_select_own_only" ON public.whatsapp_mensagens_temp;
DROP POLICY IF EXISTS "whatsapp_mensagens_temp_update_own_only" ON public.whatsapp_mensagens_temp;

CREATE POLICY "whatsapp_mensagens_temp_optimized" ON public.whatsapp_mensagens_temp
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()))
WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

-- Otimizar políticas da tabela whatsapp_messages
DROP POLICY IF EXISTS "whatsapp_messages_delete_own_only" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "whatsapp_messages_insert_own_only" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "whatsapp_messages_select_own_only" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "whatsapp_messages_update_own_only" ON public.whatsapp_messages;

CREATE POLICY "whatsapp_messages_optimized" ON public.whatsapp_messages
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()))
WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

-- 🔴 CORREÇÃO 2: Consolidar políticas múltiplas na whatsapp_sessions
-- Remover todas as políticas existentes e criar uma única política consolidada
DROP POLICY IF EXISTS "Users can manage their WhatsApp sessions" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "whatsapp_sessions_select" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "whatsapp_sessions_insert" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "whatsapp_sessions_update" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "whatsapp_sessions_delete" ON public.whatsapp_sessions;

CREATE POLICY "whatsapp_sessions_consolidated" ON public.whatsapp_sessions
FOR ALL USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 🔴 CORREÇÃO 3: Remover índices duplicados da tabela clients
-- Verificar e remover índices duplicados
DROP INDEX IF EXISTS public.idx_clients_status_active;
DROP INDEX IF EXISTS public.idx_clients_user_id_status;

-- Criar um único índice otimizado para clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id_status_optimized 
ON public.clients(user_id, status) 
WHERE status = 'Ativo';

-- Registrar correções no log de auditoria
INSERT INTO public.audit_logs (
  user_id, table_name, record_id, action, reason, new_data
) VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID,
  'system_optimization', '00000000-0000-0000-0000-000000000000'::UUID,
  'OPTIMIZE_RLS', 'Critical database optimization applied',
  jsonb_build_object(
    'rls_policies_optimized', true,
    'duplicate_policies_consolidated', true,
    'duplicate_indexes_removed', true,
    'corrections', ARRAY[
      '[RLS] todas as políticas otimizadas com SELECT ✅',
      '[RLS] políticas consolidadas em whatsapp_sessions ✅', 
      '[INDEX] duplicatas removidas em clients ✅'
    ]
  )
);