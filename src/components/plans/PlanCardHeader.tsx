
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CardHeader } from '@/components/ui/card';
import { PlanFeature } from '@/utils/plans/plansData';

interface PlanCardHeaderProps {
  plan: PlanFeature;
  isAnnual: boolean;
  currentPrice: string;
  currentPeriod: string;
  currentOriginalPrice: string;
  installmentPrice: string | null;
}

export const PlanCardHeader: React.FC<PlanCardHeaderProps> = ({
  plan,
  isAnnual,
  currentPrice,
  currentPeriod,
  currentOriginalPrice,
  installmentPrice
}) => {
  // Verificação de segurança
  if (!plan) {
    return (
      <CardHeader className="text-center space-y-4 pt-8 flex-shrink-0">
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted"></div>
          <div className="space-y-2 mt-4">
            <div className="h-6 bg-muted rounded mx-auto w-32"></div>
            <div className="h-4 bg-muted rounded mx-auto w-48"></div>
          </div>
        </div>
      </CardHeader>
    );
  }

  const IconComponent = plan.icon;

  return (
    <>
      {/* Top Badges */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 w-full max-w-[280px]">
        {plan.mostComplete && (
          <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-xl text-[10px] px-2 py-1 rounded-full font-bold border border-background whitespace-nowrap min-w-fit">
            🏆 MAIS COMPLETO
          </Badge>
        )}
        {plan.current && (
          <Badge className={`${plan.trial ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-green-600'} text-white shadow-xl rounded-full px-2 py-1 font-bold border border-background text-[10px] whitespace-nowrap min-w-fit`}>
            {plan.trial ? '⚡ SEU PLANO ATUAL' : '✓ PLANO ATIVO'}
          </Badge>
        )}
      </div>

      <CardHeader className="text-center space-y-4 pt-12 flex-shrink-0 relative overflow-visible">
        <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4 shadow-lg ${plan.mostComplete ? 'ring-2 ring-primary/30' : ''}`}>
          {IconComponent && (
            <IconComponent 
              className={`${plan.mostComplete ? 'w-8 h-8' : 'w-7 h-7'} text-primary`} 
              strokeWidth={1.5}
            />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className={`${plan.mostComplete ? 'text-2xl' : 'text-xl'} font-bold`}>
            {plan.name || 'Carregando...'}
          </h3>
          <p className={`text-sm ${plan.mostComplete ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
            {plan.description || ''}
          </p>
          <p className="text-xs text-muted-foreground">
            {plan.subtitle || ''}
          </p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline justify-center gap-1">
            {currentOriginalPrice && (
              <span className="text-lg text-muted-foreground line-through">{currentOriginalPrice}</span>
            )}
            <span className={`${
              currentPrice === 'GRÁTIS' 
                ? 'text-4xl font-black text-green-600 dark:text-green-500 tracking-wide' 
                : plan.mostComplete 
                  ? 'text-4xl text-primary' 
                  : 'text-3xl'
            } font-bold`}>
              {currentPrice || 'Indisponível'}
            </span>
            {currentPeriod && <span className="text-muted-foreground">{currentPeriod}</span>}
          </div>
          {currentOriginalPrice && (
            <div className={`text-sm font-semibold ${plan.mostComplete ? 'text-green-600 animate-pulse' : 'text-green-600'}`}>
              Economize 17%
            </div>
          )}
          {installmentPrice && (
            <div className={`text-sm ${plan.mostComplete ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              ou 10x de R$ {installmentPrice} sem juros
            </div>
          )}
        </div>
      </CardHeader>
    </>
  );
};
