
import React from 'react';
import { Check, Crown, ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { PlanFeature } from '@/utils/plans/plansData';

interface PlanCardFooterProps {
  plan: PlanFeature;
  isPlanLoading: boolean;
  onPlanSelection: (planId: string) => void;
}

export const PlanCardFooter: React.FC<PlanCardFooterProps> = ({
  plan,
  isPlanLoading,
  onPlanSelection
}) => {
  return (
    <CardFooter className="pt-4 px-6 pb-6 flex-shrink-0">
      <div className="w-full space-y-3">
        <Button 
          className={`w-full h-14 text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
            plan.current 
              ? plan.trial
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
              : plan.mostComplete 
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg animate-pulse' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
          disabled={(plan.current && !plan.trial) || isPlanLoading}
          onClick={() => onPlanSelection(plan.id)}
        >
          {isPlanLoading ? (
            "Processando..."
          ) : plan.current ? (
            plan.trial ? (
              <div className="flex items-center justify-center gap-3">
                <Rocket className="w-5 h-5 flex-shrink-0" />
                <span>FAZER UPGRADE AGORA!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>Plano Atual</span>
              </div>
            )
          ) : plan.mostComplete ? (
            <div className="flex items-center justify-center gap-3">
              <Crown className="w-6 h-6 flex-shrink-0" />
              <span>ESCOLHER O MELHOR!</span>
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span>Escolher {plan.name}</span>
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </div>
          )}
        </Button>
        
        {plan.mostComplete && (
          <div className="text-center">
            <p className="text-xs text-primary font-medium animate-pulse">
              Escolha de 89% dos nossos clientes de sucesso!
            </p>
          </div>
        )}
      </div>
    </CardFooter>
  );
};
