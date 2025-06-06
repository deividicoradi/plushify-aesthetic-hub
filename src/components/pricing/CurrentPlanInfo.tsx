
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CurrentPlanInfoProps {
  planName: string;
  isSubscribed: boolean;
  expiresAt: Date | null;
}

export const CurrentPlanInfo = ({ planName, isSubscribed, expiresAt }: CurrentPlanInfoProps) => {
  const { user } = useAuth();

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
      <h3 className="text-lg font-semibold text-card-foreground mb-2">
        Plano atual: {planName}
      </h3>
      {isSubscribed && expiresAt && (
        <p className="text-sm text-muted-foreground">
          Válido até: {new Date(expiresAt).toLocaleDateString('pt-BR')}
        </p>
      )}
      {!user && (
        <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
          ⚠️ Faça login para assinar um plano
        </p>
      )}
    </div>
  );
};
