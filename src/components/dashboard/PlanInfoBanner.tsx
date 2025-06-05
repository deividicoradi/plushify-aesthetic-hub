
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
    <div className="bg-gradient-to-r from-plush-50 to-purple-50 p-4 rounded-lg border border-plush-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-plush-800 mb-1">
            Plano {currentPlan.name}
          </h2>
          <p className="text-sm text-plush-700">
            {isSubscribed ? 
              `Acesso completo às funcionalidades do plano ${currentPlan.name}` :
              'Acesso às funcionalidades básicas'
            }
          </p>
          {currentPlan.expiresAt && (
            <p className="text-xs text-plush-600 mt-1">
              Válido até: {new Date(currentPlan.expiresAt).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        {!isSubscribed && (
          <button 
            className="bg-plush-600 hover:bg-plush-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
            onClick={() => navigate('/planos')}
          >
            Fazer upgrade
          </button>
        )}
      </div>
    </div>
  );
};
