
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

export type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' 
  | 'PAYMENT' | 'EXPORT' | 'IMPORT' | 'BACKUP' | 'RESTORE'
  | 'CONFIG_CHANGE' | 'PERMISSION_CHANGE' | 'PASSWORD_CHANGE';

interface AuditLogData {
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldData?: any;
  newData?: any;
  reason?: string;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const createAuditLog = async (data: AuditLogData) => {
    if (!user?.id) return;

    try {
      // Sanitizar dados sensíveis antes de salvar
      const sanitizedOldData = sanitizeAuditData(data.oldData);
      const sanitizedNewData = sanitizeAuditData(data.newData);

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          table_name: data.tableName,
          record_id: data.recordId,
          action: data.action,
          old_data: sanitizedOldData,
          new_data: sanitizedNewData,
          reason: data.reason
        });

      if (error) {
        console.error('Erro ao criar log de auditoria:', error);
        // Em produção, enviar para serviço de monitoramento
        if (process.env.NODE_ENV === 'production') {
          console.error('AUDIT LOG FAILED:', { data, error });
        }
      }
    } catch (error) {
      console.error('Erro crítico no sistema de auditoria:', error);
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

  // Funções específicas para ações comuns
  const logCreate = async (tableName: string, recordId: string, newData: any, reason?: string) => {
    return createAuditLog({
      action: 'CREATE',
      tableName,
      recordId,
      newData,
      reason
    });
  };

  const logUpdate = async (tableName: string, recordId: string, oldData: any, newData: any, reason?: string) => {
    return createAuditLog({
      action: 'UPDATE',
      tableName,
      recordId,
      oldData,
      newData,
      reason
    });
  };

  const logDelete = async (tableName: string, recordId: string, oldData: any, reason?: string) => {
    return createAuditLog({
      action: 'DELETE',
      tableName,
      recordId,
      oldData,
      reason
    });
  };

  const logPayment = async (paymentId: string, paymentData: any, reason?: string) => {
    return createAuditLog({
      action: 'PAYMENT',
      tableName: 'payments',
      recordId: paymentId,
      newData: paymentData,
      reason
    });
  };

  const logLogin = async (reason?: string) => {
    return createAuditLog({
      action: 'LOGIN',
      tableName: 'auth_sessions',
      recordId: user?.id || 'unknown',
      reason
    });
  };

  const logLogout = async (reason?: string) => {
    return createAuditLog({
      action: 'LOGOUT',
      tableName: 'auth_sessions',
      recordId: user?.id || 'unknown',
      reason
    });
  };

  const logExport = async (tableName: string, recordCount: number, reason?: string) => {
    return createAuditLog({
      action: 'EXPORT',
      tableName,
      recordId: 'bulk_export',
      newData: { record_count: recordCount },
      reason
    });
  };

  return {
    createAuditLog,
    getAuditLogs,
    logCreate,
    logUpdate,
    logDelete,
    logPayment,
    logLogin,
    logLogout,
    logExport
  };
};

// Função para sanitizar dados sensíveis nos logs de auditoria
const sanitizeAuditData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password', 'senha', 'token', 'secret', 'key', 'authorization',
    'credit_card', 'cpf', 'cnpj', 'phone', 'email'
  ];

  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    // Verificar se é um campo sensível
    const isSensitive = sensitiveFields.some(field => 
      lowerKey.includes(field)
    );

    if (isSensitive && sanitized[key]) {
      if (typeof sanitized[key] === 'string') {
        // Mascarar dados sensíveis
        if (lowerKey.includes('email')) {
          const email = sanitized[key];
          const [local, domain] = email.split('@');
          sanitized[key] = `${local.charAt(0)}***@${domain}`;
        } else if (lowerKey.includes('phone')) {
          const phone = sanitized[key].replace(/\D/g, '');
          sanitized[key] = `***${phone.slice(-4)}`;
        } else if (lowerKey.includes('cpf')) {
          sanitized[key] = '***.**-' + sanitized[key].slice(-2);
        } else {
          sanitized[key] = '***REDACTED***';
        }
      } else {
        sanitized[key] = '***REDACTED***';
      }
    }

    // Sanitizar objetos aninhados recursivamente
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeAuditData(sanitized[key]);
    }
  });

  return sanitized;
};
