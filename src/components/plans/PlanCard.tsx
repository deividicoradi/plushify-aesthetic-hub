
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlanFeature } from '@/utils/plans/plansData';
import { PlanCardHeader } from './PlanCardHeader';
import { PlanCardFeatures } from './PlanCardFeatures';
import { PlanCardBonuses } from './PlanCardBonuses';
import { PlanCardFooter } from './PlanCardFooter';

interface PlanCardProps {
  plan: PlanFeature;
  isAnnual: boolean;
  onPlanSelection: (planId: string) => void;
  isLoading: (planKey: string) => boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isAnnual,
  onPlanSelection,
  isLoading
}) => {
  const currentPrice = isAnnual ? plan.annualPrice : plan.price;
  const currentPeriod = isAnnual ? plan.annualPeriod : plan.period;
  const currentOriginalPrice = isAnnual ? plan.annualOriginalPrice : plan.originalPrice;
  const installmentPrice = isAnnual && plan.annualPrice !== 'Gratuito' 
    ? `${Math.round(parseInt(plan.annualPrice.replace('R$ ', '').replace('.', '')) / 10)}`
    : null;

  const planLoadingKey = `${plan.id}_${isAnnual ? 'annual' : 'monthly'}`;
  const isPlanLoading = isLoading(planLoadingKey);

  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] h-full flex flex-col min-h-[800px] ${
        plan.mostComplete
          ? 'border-2 border-primary shadow-xl bg-gradient-to-br from-background to-primary/5 scale-105 z-10' 
          : plan.current 
            ? plan.trial
              ? 'border-2 border-orange-400 bg-gradient-to-br from-background to-orange-50/20 dark:to-orange-950/20' 
              : 'border-2 border-emerald-400 bg-gradient-to-br from-background to-emerald-50/20 dark:to-emerald-950/20'
            : 'border hover:border-primary/50'
      }`}
    >
      <PlanCardHeader
        plan={plan}
        isAnnual={isAnnual}
        currentPrice={currentPrice}
        currentPeriod={currentPeriod}
        currentOriginalPrice={currentOriginalPrice}
        installmentPrice={installmentPrice}
      />

      <CardContent className="space-y-4 px-6 flex-1">
        <PlanCardFeatures plan={plan} />
        <PlanCardBonuses plan={plan} />
      </CardContent>

      <PlanCardFooter
        plan={plan}
        isPlanLoading={isPlanLoading}
        onPlanSelection={onPlanSelection}
      />
    </Card>
  );
};
