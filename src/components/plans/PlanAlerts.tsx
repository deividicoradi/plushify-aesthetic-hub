
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
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-orange-600 animate-bounce" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Trial Expirando!</h3>
              <p className="text-orange-700 dark:text-orange-300 mt-1">
                Não perca seus dados! Escolha um plano agora e continue crescendo seu negócio.
              </p>
            </div>
            <Button 
              onClick={() => onPlanSelection('premium')}
              disabled={isLoading('premium_' + (isAnnual ? 'annual' : 'monthly'))}
              className="bg-primary hover:bg-primary/90"
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
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Plano {currentPlan === 'professional' ? 'Professional' : 'Enterprise'} Ativo
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Você está aproveitando todo o poder da nossa plataforma!
                </p>
              </div>
            </div>
            <Button 
              onClick={onManageSubscription}
              disabled={isLoading('customer_portal')}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
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
