
import React from 'react';
import { PlanCard } from './PlanCard';
import { PlanFeature } from '@/utils/plans/plansData';

interface PlansGridProps {
  plans: PlanFeature[];
  isAnnual: boolean;
  onPlanSelection: (planId: string) => void;
  isLoading: (planKey: string) => boolean;
}

export const PlansGrid: React.FC<PlansGridProps> = ({
  plans,
  isAnnual,
  onPlanSelection,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isAnnual={isAnnual}
          onPlanSelection={onPlanSelection}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
