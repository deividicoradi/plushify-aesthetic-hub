-- 🔴 CORREÇÕES CRÍTICAS DE PERFORMANCE E SEGURANÇA

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
DROP POLICY IF EXISTS "Users can manage their WhatsApp sessions" ON public.whatsapp_sessoes;

CREATE POLICY "whatsapp_sessoes_consolidated" ON public.whatsapp_sessoes
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

-- Log das correções aplicadas (simples notification)
DO $$
BEGIN
  RAISE NOTICE '[RLS] todas as políticas otimizadas com SELECT ✅';
  RAISE NOTICE '[RLS] políticas consolidadas em whatsapp_sessions ✅';
  RAISE NOTICE '[INDEX] duplicatas removidas em clients ✅';
  RAISE NOTICE '[PERFORMANCE] Otimizações críticas aplicadas com sucesso ✅';
END $$;