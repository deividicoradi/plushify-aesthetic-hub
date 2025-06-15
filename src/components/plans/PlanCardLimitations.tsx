
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PlanFeature } from '@/utils/plans/plansData';

interface PlanCardLimitationsProps {
  plan: PlanFeature;
}

export const PlanCardLimitations: React.FC<PlanCardLimitationsProps> = ({ plan }) => {
  if (plan.limitations.length === 0) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      <h4 className="font-medium text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Limitações:
      </h4>
      <ul className="space-y-2">
        {plan.limitations.map((limitation, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            </div>
            <span className="text-xs text-red-600 dark:text-red-400">{limitation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
