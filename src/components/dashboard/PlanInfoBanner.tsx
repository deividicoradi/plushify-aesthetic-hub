
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle, CheckCircle, TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useAuth } from '@/contexts/AuthContext';

// E-mail do usuário de teste
const TEST_USER_EMAIL = 'deividi@teste.com';

export const PlanInfoBanner = () => {
  const { currentPlan, limits } = usePlanLimits();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isTestUser = user?.email === TEST_USER_EMAIL;

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'trial': return 'bg-yellow-500';
      case 'professional': return 'bg-blue-500';
      case 'premium': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'trial': return 'Gratuito';
      case 'professional': return 'Profissional';
      case 'premium': return 'Premium';
      default: return 'Desconhecido';
    }
  };

  // Banner especial para usuário de teste
  if (isTestUser) {
    return (
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <TestTube className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-800 dark:text-blue-200">
              Modo de teste ativo - Você tem acesso completo a todas as funcionalidades!
            </span>
            <Badge className="bg-blue-500 text-white">
              <TestTube className="w-3 h-3 mr-1" />
              Usuário de Teste
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (currentPlan === 'premium') {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-800 dark:text-green-200">
              Você tem acesso completo a todas as funcionalidades!
            </span>
            <Badge className={`${getPlanColor(currentPlan)} text-white`}>
              <Crown className="w-3 h-3 mr-1" />
              {getPlanLabel(currentPlan)}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-orange-800 dark:text-orange-200">
            {currentPlan === 'trial' 
              ? 'Você está no plano gratuito com funcionalidades limitadas.'
              : 'Algumas funcionalidades avançadas requerem upgrade.'
            }
          </span>
          <Badge className={`${getPlanColor(currentPlan)} text-white`}>
            {getPlanLabel(currentPlan)}
          </Badge>
        </div>
        <Button 
          size="sm" 
          onClick={() => navigate('/planos')}
          className="bg-primary hover:bg-primary/90"
        >
          Fazer Upgrade
        </Button>
      </AlertDescription>
    </Alert>
  );
};
