
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PricingTier } from './PricingTier';
import { PlanConfig } from './planConfig';
import { SubscriptionTier } from '@/hooks/useSubscription';

interface PricingTabsProps {
  plans: PlanConfig[];
  isYearly: boolean;
  setIsYearly: (value: boolean) => void;
  isLoading: boolean;
  processingPlan: string | null;
  currentTier: SubscriptionTier;
  onSubscribe: (tier: SubscriptionTier) => void;
}

export const PricingTabs = ({
  plans,
  isYearly,
  setIsYearly,
  isLoading,
  processingPlan,
  currentTier,
  onSubscribe,
}: PricingTabsProps) => {
  return (
    <Tabs defaultValue="mensal" className="w-full mt-8">
      <TabsList className="mx-auto mb-4 border border-plush-200 bg-white">
        <TabsTrigger 
          value="mensal" 
          onClick={() => setIsYearly(false)}
        >
          Mensal
        </TabsTrigger>
        <TabsTrigger 
          value="anual" 
          onClick={() => setIsYearly(true)}
        >
          Anual <span className="text-xs font-medium ml-1">(-20%)</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="mensal">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 mt-8">
          {plans.map((plan) => (
            <PricingTier
              key={`mensal-${plan.tier}`}
              tier={plan.tier}
              isPopular={plan.isPopular}
              isYearly={false}
              title={plan.title}
              price={plan.price}
              yearlyPrice={plan.yearlyPrice}
              parcelValue={plan.parcelValue}
              description={plan.description}
              features={plan.features}
              buttonText={plan.buttonText}
              isLoading={isLoading || processingPlan === plan.tier}
              isCurrentPlan={currentTier === plan.tier}
              onSubscribe={() => onSubscribe(plan.tier)}
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="anual">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 mt-8">
          {plans.map((plan) => (
            <PricingTier
              key={`anual-${plan.tier}`}
              tier={plan.tier}
              isPopular={plan.isPopular}
              isYearly={true}
              title={plan.title}
              price={plan.price}
              yearlyPrice={plan.yearlyPrice}
              parcelValue={plan.parcelValue}
              description={plan.description}
              features={plan.features}
              buttonText={plan.buttonText}
              isLoading={isLoading || processingPlan === plan.tier}
              isCurrentPlan={currentTier === plan.tier}
              onSubscribe={() => onSubscribe(plan.tier)}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
