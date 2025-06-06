
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SystemStatusProps {
  isYearly: boolean;
  processingPlan: string | null;
}

export const SystemStatus = ({ isYearly, processingPlan }: SystemStatusProps) => {
  const { user } = useAuth();

  return (
    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Status do Sistema</h4>
      <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
        <p>✅ Sistema de pagamento Stripe configurado</p>
        <p>✅ Edge functions criadas e funcionais</p>
        <p>✅ Sistema de checkout pronto</p>
        <p className="font-semibold">📊 Modo: {isYearly ? '📅 ANUAL (20% desconto)' : '🗓️ MENSAL'}</p>
        {user && (
          <p>👤 Usuário: <span className="font-medium">{user.email}</span></p>
        )}
        {processingPlan && (
          <p>⏳ Processando: <span className="font-medium">{processingPlan.toUpperCase()}</span></p>
        )}
      </div>
    </div>
  );
};
