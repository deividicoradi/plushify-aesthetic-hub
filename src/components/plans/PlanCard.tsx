
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlanFeature } from '@/utils/plans/plansData';
import { PlanCardHeader } from './PlanCardHeader';
import { PlanCardFeatures } from './PlanCardFeatures';
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
    ? (() => {
        try {
          const cleanPrice = plan.annualPrice.replace(/[R$\s\.]/g, '').replace(',', '.');
          const numericPrice = parseFloat(cleanPrice);
          return isNaN(numericPrice) ? null : Math.round(numericPrice / 10).toString();
        } catch {
          return null;
        }
      })()
    : null;

  const planLoadingKey = `${plan.id}_${isAnnual ? 'annual' : 'monthly'}`;
  const isPlanLoading = isLoading(planLoadingKey);

  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.03] h-full flex flex-col min-h-[600px] rounded-2xl overflow-hidden ${
        plan.mostComplete
          ? 'border-2 border-primary shadow-2xl bg-gradient-to-br from-background via-primary/5 to-secondary/5 scale-105 z-10 ring-2 ring-primary/20' 
          : plan.current 
            ? plan.trial
              ? 'border-2 border-orange-500 bg-gradient-to-br from-background to-orange-50/30 dark:to-orange-950/30 shadow-lg' 
              : 'border-2 border-emerald-500 bg-gradient-to-br from-background to-emerald-50/30 dark:to-emerald-950/30 shadow-lg'
            : 'border-2 border-border/50 hover:border-primary/70 bg-gradient-to-br from-background to-muted/20 shadow-md hover:shadow-xl'
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

      <CardContent className="px-6 py-4 flex-1 flex flex-col">
        <div className="flex-1">
          <PlanCardFeatures plan={plan} />
        </div>
      </CardContent>

      <PlanCardFooter
        plan={plan}
        isPlanLoading={isPlanLoading}
        onPlanSelection={onPlanSelection}
      />
    </Card>
  );
};
