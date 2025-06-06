
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PlanInfoBannerProps {
  currentPlan: {
    name: string;
    expiresAt?: Date | null;
  };
  isSubscribed: boolean;
}

export const PlanInfoBanner = ({ currentPlan, isSubscribed }: PlanInfoBannerProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-primary/10 to-rose-50 p-4 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary mb-1">
            Plano {currentPlan.name}
          </h2>
          <p className="text-sm text-primary/80">
            {isSubscribed ? 
              `Acesso completo às funcionalidades do plano ${currentPlan.name}` :
              'Acesso às funcionalidades básicas'
            }
          </p>
          {currentPlan.expiresAt && (
            <p className="text-xs text-primary/70 mt-1">
              Válido até: {new Date(currentPlan.expiresAt).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        {!isSubscribed && (
          <button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors text-sm"
            onClick={() => navigate('/planos')}
          >
            Fazer upgrade
          </button>
        )}
      </div>
    </div>
  );
};
