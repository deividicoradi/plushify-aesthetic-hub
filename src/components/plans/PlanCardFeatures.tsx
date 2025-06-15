
import React from 'react';
import { Check, Star } from 'lucide-react';
import { PlanFeature } from '@/utils/plans/plansData';

interface PlanCardFeaturesProps {
  plan: PlanFeature;
}

export const PlanCardFeatures: React.FC<PlanCardFeaturesProps> = ({ plan }) => {
  return (
    <div className="space-y-3">
      <h4 className={`font-semibold flex items-center gap-2 ${plan.mostComplete ? 'text-base' : 'text-sm'}`}>
        <Star className={`${plan.mostComplete ? 'w-5 h-5 text-yellow-500' : 'w-4 h-4 text-green-500'}`} />
        {plan.trial ? 'Limitações do Trial:' : 'Recursos inclusos:'}
      </h4>
      <ul className="space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className={`w-4 h-4 rounded-full ${plan.mostComplete ? 'bg-primary' : 'bg-green-500'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <span className={`text-xs leading-relaxed ${plan.mostComplete ? 'font-medium' : ''}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
