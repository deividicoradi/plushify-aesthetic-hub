
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

interface AuditLogData {
  tableName: string;
  recordId: string;
  action: 'UPDATE' | 'DELETE';
  oldData?: any;
  newData?: any;
  reason?: string;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const createAuditLog = async (data: AuditLogData) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          table_name: data.tableName,
          record_id: data.recordId,
          action: data.action,
          old_data: data.oldData,
          new_data: data.newData,
          reason: data.reason
        });

      if (error) {
        console.error('Erro ao criar log de auditoria:', error);
        // Não mostramos erro para o usuário pois é um processo interno
      }
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error);
    }
  };

  const getAuditLogs = async (tableName?: string, recordId?: string) => {
    if (!user?.id) return [];

    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tableName) {
        query = query.eq('table_name', tableName);
      }

      if (recordId) {
        query = query.eq('record_id', recordId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      return [];
    }
  };

  return {
    createAuditLog,
    getAuditLogs
  };
};
