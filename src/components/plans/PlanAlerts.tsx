
import React from 'react';
import { AlertTriangle, Check, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PlanAlertsProps {
  currentPlan: string;
  onPlanSelection: (planId: string) => void;
  onManageSubscription: () => void;
  isLoading: (planKey: string) => boolean;
  isAnnual: boolean;
}

export const PlanAlerts: React.FC<PlanAlertsProps> = ({
  currentPlan,
  onPlanSelection,
  onManageSubscription,
  isLoading,
  isAnnual
}) => {
  if (currentPlan === 'trial') {
    return (
      <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <AlertTriangle className="w-8 h-8 text-orange-600 animate-bounce flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-orange-800 dark:text-orange-200">Trial Expirando!</h3>
              <p className="text-sm sm:text-base text-orange-700 dark:text-orange-300 mt-1">
                Não perca seus dados! Escolha um plano agora e continue crescendo seu negócio.
              </p>
            </div>
            <Button 
              onClick={() => onPlanSelection('premium')}
              disabled={isLoading('premium_' + (isAnnual ? 'annual' : 'monthly'))}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto flex-shrink-0"
            >
              {isLoading('premium_' + (isAnnual ? 'annual' : 'monthly')) ? "Processando..." : "Upgrade Agora!"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentPlan === 'professional' || currentPlan === 'premium') {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200">
                  Plano {currentPlan === 'professional' ? 'Professional' : 'Enterprise'} Ativo
                </h3>
                <p className="text-sm sm:text-base text-green-700 dark:text-green-300">
                  Você está aproveitando todo o poder da nossa plataforma!
                </p>
              </div>
            </div>
            <Button 
              onClick={onManageSubscription}
              disabled={isLoading('customer_portal')}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 w-full sm:w-auto flex-shrink-0"
            >
              {isLoading('customer_portal') ? "Carregando..." : "Gerenciar Assinatura"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
