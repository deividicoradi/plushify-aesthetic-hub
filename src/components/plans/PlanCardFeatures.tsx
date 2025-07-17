
import React from 'react';
import { Check, Star } from 'lucide-react';
import { PlanFeature } from '@/utils/plans/plansData';
import { UserLimitTooltip } from './UserLimitTooltip';

interface PlanCardFeaturesProps {
  plan: PlanFeature;
}

export const PlanCardFeatures: React.FC<PlanCardFeaturesProps> = ({ plan }) => {
  // Verificação de segurança para evitar erros
  if (!plan || !plan.features) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Carregando recursos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className={`font-semibold flex items-center gap-2 ${plan.mostComplete ? 'text-base' : 'text-sm'}`}>
        <Star className={`${plan.mostComplete ? 'w-5 h-5 text-primary' : 'w-4 h-4 text-emerald-500'}`} />
        {plan.trial ? 'Limitações do Trial:' : 'Recursos inclusos:'}
      </h4>
      <ul className="space-y-2">
        {plan.features.map((feature, index) => {
          const isUserLimit = feature.includes('usuário') || feature.includes('Até');
          return (
            <li key={index} className="flex items-start gap-2">
              <div className={`w-4 h-4 rounded-full ${plan.mostComplete ? 'bg-primary' : 'bg-emerald-500'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="flex items-center gap-1 flex-1">
                <span className={`text-xs leading-relaxed ${plan.mostComplete ? 'font-medium' : ''}`}>
                  {feature}
                </span>
                {isUserLimit && (
                  <UserLimitTooltip planType={plan.id as 'trial' | 'professional' | 'premium'} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      
      {/* Mostrar limitações se existirem */}
      {plan.limitations && plan.limitations.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-border/30">
          <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
            Limitações:
          </h5>
          <ul className="space-y-1">
            {plan.limitations.map((limitation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[8px] text-muted-foreground">×</span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-relaxed">
                  {limitation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
