
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlanLimits } from '@/hooks/usePlanLimits';

interface LimitAlertProps {
  type: 'clients' | 'appointments' | 'products' | 'services';
  currentCount: number;
  action?: string;
}

export const LimitAlert = ({ type, currentCount, action = 'criar' }: LimitAlertProps) => {
  const { hasReachedLimit, getLimit, currentPlan } = usePlanLimits();
  const navigate = useNavigate();
  
  const limit = getLimit(type);
  const isAtLimit = hasReachedLimit(type, currentCount);
  
  const typeLabels = {
    clients: 'clientes',
    appointments: 'agendamentos',
    products: 'produtos',
    services: 'serviços'
  };
  
  if (!isAtLimit || limit === -1) {
    return null;
  }
  
  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="text-orange-800 dark:text-orange-200 font-medium">
            Limite atingido no plano {currentPlan}
          </p>
          <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
            Você atingiu o limite de {limit} {typeLabels[type]}. 
            Faça upgrade para {action} mais {typeLabels[type]}.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/planos')}
          className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
        >
          <Crown className="w-4 h-4 mr-2" />
          Fazer Upgrade
        </Button>
      </AlertDescription>
    </Alert>
  );
};
