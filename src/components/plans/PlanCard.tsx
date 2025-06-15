
import React from 'react';
import { Check, Crown, Zap, Star, ArrowRight, Clock, AlertTriangle, Gift, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanFeature } from '@/utils/plans/plansData';

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

  const IconComponent = plan.icon;
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
              : 'border-2 border-green-400 bg-gradient-to-br from-background to-green-50/20 dark:to-green-950/20'
            : 'border hover:border-primary/50'
      }`}
    >
      {/* Top Badges */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-20">
        {plan.mostComplete && (
          <Badge className="bg-primary text-primary-foreground shadow-lg text-sm px-3 py-1 animate-pulse">
            🔥 MAIS COMPLETO
          </Badge>
        )}
        {plan.current && (
          <Badge className={`${plan.trial ? 'bg-orange-500' : 'bg-green-500'} text-white shadow-lg`}>
            {plan.trial ? 'Trial Ativo' : 'Plano Atual'}
          </Badge>
        )}
      </div>

      <CardHeader className="text-center space-y-4 pt-8 flex-shrink-0">
        <div className={`w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center p-4 ${plan.mostComplete ? 'animate-pulse' : ''}`}>
          <IconComponent 
            className={`${plan.mostComplete ? 'w-8 h-8' : 'w-7 h-7'} text-primary`} 
            strokeWidth={1.5}
          />
        </div>
        
        <div className="space-y-2">
          <h3 className={`${plan.mostComplete ? 'text-2xl' : 'text-xl'} font-bold`}>
            {plan.name}
          </h3>
          <p className={`text-sm ${plan.mostComplete ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
            {plan.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {plan.subtitle}
          </p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline justify-center gap-1">
            {currentOriginalPrice && (
              <span className="text-lg text-muted-foreground line-through">{currentOriginalPrice}</span>
            )}
            <span className={`${plan.mostComplete ? 'text-4xl text-primary' : 'text-3xl'} font-bold`}>
              {currentPrice}
            </span>
            {currentPeriod && <span className="text-muted-foreground">{currentPeriod}</span>}
          </div>
          {currentOriginalPrice && (
            <div className={`text-sm font-semibold ${plan.mostComplete ? 'text-green-600 animate-pulse' : 'text-green-600'}`}>
              Economize {Math.round((1 - parseInt(currentPrice.replace('R$ ', '').replace('.', '')) / parseInt(currentOriginalPrice.replace('R$ ', '').replace('.', ''))) * 100)}%
            </div>
          )}
          {installmentPrice && (
            <div className={`text-sm ${plan.mostComplete ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              ou 10x de R$ {installmentPrice} sem juros
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 flex-1">
        {/* Features */}
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

        {/* Premium Bonuses */}
        {plan.bonuses && (
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
        )}

        {/* Limitations */}
        {plan.limitations.length > 0 && (
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
        )}
      </CardContent>

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
    </Card>
  );
};
