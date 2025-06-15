
import React from 'react';
import { Gift } from 'lucide-react';
import { PlanFeature } from '@/utils/plans/plansData';

interface PlanCardBonusesProps {
  plan: PlanFeature;
}

export const PlanCardBonuses: React.FC<PlanCardBonusesProps> = ({ plan }) => {
  if (!plan.bonuses) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      <h4 className="font-semibold text-primary text-sm flex items-center gap-2">
        <Gift className="w-4 h-4" />
        Bônus Exclusivos:
      </h4>
      <ul className="space-y-2">
        {plan.bonuses.map((bonus, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Gift className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs font-medium text-primary">{bonus}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
