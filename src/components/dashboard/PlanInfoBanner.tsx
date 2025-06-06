
import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface PlanInfoBannerProps {
  currentPlan: any;
  isSubscribed: boolean;
}

export const PlanInfoBanner = ({ currentPlan, isSubscribed }: PlanInfoBannerProps) => {
  const navigate = useNavigate();
  const { tier } = useSubscription();

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full">
                <Crown className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100">
                  Plano {tier === 'starter' ? 'Starter' : tier === 'pro' ? 'Pro' : 'Premium'} Ativo
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Aproveitando todos os recursos do seu plano
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/20 dark:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-full">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-card-foreground">Plano Gratuito</h3>
              <p className="text-sm text-muted-foreground">
                Acesso às funcionalidades básicas
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/planos')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Fazer upgrade
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
